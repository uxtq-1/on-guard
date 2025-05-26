/*****************************************************
 * join-handler.js
 * Secure Join Us form handler for OPS Solutions
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const joinForm = document.getElementById("join-form");

  const sanitizeInput = input => input.replace(/<[^>]*>/g, "").trim();

  // Validate allowed file MIME types for resume and cover letter
  const isValidFile = file => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    return file && allowedTypes.includes(file.type);
  };

  // Generate cryptographically secure UUID v4
  function generateSecureUUID() {
    const cryptoObj = window.crypto || window.msCrypto;
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant

    const hexBytes = [...bytes].map(b => b.toString(16).padStart(2, "0"));

    return [
      hexBytes.slice(0, 4).join(""),
      hexBytes.slice(4, 6).join(""),
      hexBytes.slice(6, 8).join(""),
      hexBytes.slice(8, 10).join(""),
      hexBytes.slice(10, 16).join("")
    ].join("-");
  }

  // Generate 12-byte random nonce for AES-GCM
  const generateNonce = () => {
    const array = new Uint8Array(12);
    window.crypto.getRandomValues(array);
    return array;
  };

  // Convert ArrayBuffer to Base64 string
  const arrayBufferToBase64 = buffer => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Encrypt file using AES-GCM
  async function encryptFile(file, key) {
    const iv = generateNonce();
    const data = await file.arrayBuffer();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );
    return { encryptedData: encrypted, iv };
  }

  // Generate AES-GCM 256-bit key
  async function generateAESKey() {
    return window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Export raw AES key as Base64 for transmission
  async function exportCryptoKey(key) {
    const raw = await window.crypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(raw);
  }

  // Generate HMAC SHA-512 signature
  async function generateHMAC(data, secretKey) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  joinForm?.addEventListener("submit", async e => {
    e.preventDefault();

    // Honeypot check
    const honeypot = document.getElementById("join-hidden-field")?.value || "";
    if (honeypot) {
      alert("Bot detected. Submission blocked.");
      return;
    }

    // Sanitize inputs
    const name = sanitizeInput(document.getElementById("name").value);
    const email = sanitizeInput(document.getElementById("email").value);
    const phone = sanitizeInput(document.getElementById("phone").value);
    const comment = sanitizeInput(document.getElementById("comment").value);

    // Validate files
    const resumeFile = document.getElementById("resume").files[0];
    const coverFile = document.getElementById("cover").files[0];

    if (!isValidFile(resumeFile) || !isValidFile(coverFile)) {
      alert("Only PDF or Word documents are allowed for resume and cover letter.");
      return;
    }

    // Asset ID from hidden input or generate new
    let assetIdInput = document.getElementById("asset-id");
    let assetId = assetIdInput?.value || generateSecureUUID();

    if (!assetIdInput?.value && assetIdInput) {
      assetIdInput.value = assetId;
    }

    // Generate AES key and export it as base64 for backend (wrap/encrypt key in production)
    const aesKey = await generateAESKey();
    const exportedAesKey = await exportCryptoKey(aesKey);

    // Encrypt files
    const { encryptedData: encryptedResume, iv: ivResume } = await encryptFile(resumeFile, aesKey);
    const { encryptedData: encryptedCover, iv: ivCover } = await encryptFile(coverFile, aesKey);

    // Convert encrypted data and IVs to base64 for transmission
    const encryptedResumeBase64 = arrayBufferToBase64(encryptedResume);
    const encryptedCoverBase64 = arrayBufferToBase64(encryptedCover);
    const ivResumeBase64 = arrayBufferToBase64(ivResume);
    const ivCoverBase64 = arrayBufferToBase64(ivCover);

    // Generate nonce and timestamp for metadata
    const nonceArray = generateNonce();
    const nonceBase64 = arrayBufferToBase64(nonceArray);
    const timestamp = new Date().toISOString();

    const metadata = {
      assetId,
      name,
      email,
      phone,
      comment,
      nonce: nonceBase64,
      timestamp,
      exportedAesKey,  // In prod, encrypt/wrap this key before sending
      ivResume: ivResumeBase64,
      ivCover: ivCoverBase64,
      resumeFileName: resumeFile.name,
      coverFileName: coverFile.name
    };

    // HMAC secret key — replace with secure environment management in prod
    const secretKey = "your-very-secret-client-key";

    // Generate HMAC signature for integrity/authentication
    const hmacInput = JSON.stringify(metadata);
    const hmac = await generateHMAC(hmacInput, secretKey);

    // Prepare form data for transmission
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("hmac", hmac);
    formData.append("encryptedResume", new Blob([encryptedResume], { type: "application/octet-stream" }), resumeFile.name);
    formData.append("encryptedCover", new Blob([encryptedCover], { type: "application/octet-stream" }), coverFile.name);

    // Submit to backend endpoint — change URL to your Worker or API
    try {
      const response = await fetch("https://your-cloudflare-worker-or-api/submitJoin", {
        method: "POST",
        body: formData,
        credentials: "omit"
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      alert("✅ Your application has been securely submitted!");
      joinForm.reset();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("⚠️ Upload failed, please try again later.");
    }
  });
});
