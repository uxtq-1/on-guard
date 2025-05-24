/*****************************************************
 * join-handler.js
 * Secure Join Us form handler for OPS Solutions
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const joinForm = document.getElementById("join-form");

  const sanitizeInput = input => input.replace(/<[^>]*>/g, "").trim();

  const isValidFile = file => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    return file && allowedTypes.includes(file.type);
  };

  const generateNonce = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const generateTimestamp = () => new Date().toISOString();

  const generateHMAC = async (data, secretKey) => {
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
  };

  joinForm?.addEventListener("submit", async e => {
    e.preventDefault();

    const name = sanitizeInput(document.getElementById("name").value);
    const email = sanitizeInput(document.getElementById("email").value);
    const phone = sanitizeInput(document.getElementById("phone").value);
    const comment = sanitizeInput(document.getElementById("comment").value);

    const resumeFile = document.getElementById("resume").files[0];
    const coverFile = document.getElementById("cover").files[0];

    if (!isValidFile(resumeFile) || !isValidFile(coverFile)) {
      alert("Only PDF or Word documents are allowed.");
      return;
    }

    // Placeholder: Malware scan would happen here via WASM, sandbox, or AV API

    const nonce = generateNonce();
    const timestamp = generateTimestamp();

    const metadata = {
      name,
      email,
      phone,
      comment,
      nonce,
      timestamp,
      fileName: resumeFile.name,
      contentType: resumeFile.type
    };

    const secretKey = "your-very-secret-client-key"; // 🔒 Replace in production
    const hmacInput = JSON.stringify(metadata);
    const hmac = await generateHMAC(hmacInput, secretKey);

    // At this stage, you can POST to Cloudflare Worker or Apps Script API
    console.log("📦 Payload ready to send:", {
      metadata,
      hmac,
      resumeFile,
      coverFile
    });

    alert("✅ Your information has been secured and is ready for transmission.");
    joinForm.reset();
  });
});
