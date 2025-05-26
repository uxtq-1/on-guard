/*****************************************************
 * contact-handler.js
 * Secure Contact Us form handler for OPS Solutions
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");

  const sanitizeInput = input => input.replace(/<[^>]*>/g, "").trim();

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

    // Honeypot check
    const honeypot = document.getElementById("contact-address")?.value || "";
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

    if (!assetIdInput?.value && assetIdInput) {
      assetIdInput.value = assetId;
    }

    const nonce = generateNonce();
    const timestamp = generateTimestamp();

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

    const secretKey = "your-very-secret-client-key"; // Replace in production

    const hmacInput = JSON.stringify(metadata);
    const hmac = await generateHMAC(hmacInput, secretKey);

    const payload = {
      metadata,
      hmac
    };

    // Replace below URL with your Cloudflare Worker endpoint
    try {
      const response = await fetch("https://your-cloudflare-worker-or-api/submitContact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
          // Include CSP nonce headers or auth tokens here if needed
        },
        body: JSON.stringify(payload),
        credentials: "omit"
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      alert("✅ Your message has been securely submitted!");
      contactForm.reset();
    } catch (err) {
      console.error("Submission failed:", err);
      alert("⚠️ Submission failed, please try again later.");
    }
  });
});
