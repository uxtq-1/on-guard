/*****************************************************
 * join-handler.js
 * Secure Join Us form handler for OPS Solutions
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const joinForm = document.getElementById("join-form");

  const sanitizeInput = input => input.replace(/<[^>]*>/g, "").trim();

  // Validate allowed file MIME types for resume and cover
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

  // Generate 16-byte random nonce in hex
  function generateNonce() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  const generateTimestamp = () => new Date().toISOString();

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

    if (!as
