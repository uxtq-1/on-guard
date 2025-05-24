/*****************************************************
 * contact-handler.js
 * Secure Contact Us form handler for OPS Solutions
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");

  const sanitizeInput = input => input.replace(/<[^>]*>/g, "").trim();

  const generateNonce = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
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

  contactForm?.addEventListener("submit", async e => {
    e.preventDefault();

    const name = sanitizeInput(document.getElementById("contact-name").value);
    const email = sanitizeInput(document.getElementById("contact-email").value);
    const phone = sanitizeInput(document.getElementById("contact-number").value);
    const date = document.getElementById("contact-date").value;
    const time = document.getElementById("contact-time").value;
    const message = sanitizeInput(document.getElementById("contact-comments").value);

    const nonce = generateNonce();
    const timestamp = generateTimestamp();

    const metadata = {
      name,
      email,
      phone,
      preferredDate: date,
      preferredTime: time,
      message,
      nonce,
      timestamp
    };

    const secretKey = "your-very-secret-client-key"; // 🔐 Replace in production
    const hmacInput = JSON.stringify(metadata);
    const hmac = await generateHMAC(hmacInput, secretKey);

    // Ready to transmit securely via Worker API
    console.log("📨 Contact payload ready:", {
      metadata,
      hmac
    });

    alert("✅ Your message has been secured and is ready for transmission.");
    contactForm.reset();
  });
});
