/*****************************************************
 * contact-handler.js
 * Secure Contact Us form handler for OPS Solutions
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");

  // Sanitize input against simple XSS
  const sanitizeInput = input => input.replace(/<[^>]*>/g, "").trim();

  // Generate a cryptographically secure UUID v4
  function generateSecureUUID() {
    // returns uuid format string: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const cryptoObj = window.crypto || window.msCrypto;
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);

    // Set version bits (4) and variant bits (8,9,A,B)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

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

  // Timestamp ISO format
  const generateTimestamp = () => new Date().toISOString();

  // HMAC SHA-512 generation using Web Crypto API
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

  contactForm?.addEventListener("submit", async e => {
    e.preventDefault();

    // Honeypot check: if filled, block submission immediately
    const honeypot = document.getElementById("contact-address").value;
    if (honeypot) {
      alert("Bot detected. Submission blocked.");
      return;
    }

    // Sanitize inputs
    const name = sanitizeInput(document.getElementById("contact-name").value);
    const email = sanitizeInput(document.getElementById("contact-email").value);
    const phone = sanitizeInput(document.getElementById("contact-number").value);
    const date = document.getElementById("contact-date").value;
    const time = document.getElementById("contact-time").value;
    const message = sanitizeInput(document.getElementById("contact-comments").value);

    // Generate or retrieve the asset ID from hidden input
    let assetIdInput = document.getElementById("asset-id");
    let assetId = assetIdInput?.value || generateSecureUUID();

    // If the hidden field is empty (unlikely), fill it dynamically
    if (!assetIdInput?.value) {
      if (assetIdInput) assetIdInput.value = assetId;
    }

    // Generate nonce and timestamp for this submission
    const nonce = generateNonce();
    const timestamp = generateTimestamp();

    // Package metadata to sign
    const metadata = {
      assetId,
      name,
      email,
      phone,
      preferredDate: date,
      preferredTime: time,
      message,
      nonce,
      timestamp
    };

    // Secret key for HMAC - replace with secure env var or secret manager in prod
    const secretKey = "your-very-secret-client-key";

    const hmacInput = JSON.stringify(metadata);
    const hmac = await generateHMAC(hmacInput, secretKey);

    // Prepare payload for secure transmission (encryption TBD in next phase)
    const payload = {
      metadata,
      hmac
    };

    console.log("📨 Secure Contact payload ready:", payload);
    alert("✅ Your message has been secured and is ready for transmission.");

    contactForm.reset();
  });
});
