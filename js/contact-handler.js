// js/contact-handler.js  – secure, lazy-crypto form submission
// js/contact-handler.js  – secure, lazy-crypto Contact form submission

(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const enc = new TextEncoder();
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const clean = s => s.replace(/<[^>]*>/g, "").trim();
  const uuid = () => crypto.randomUUID();
  const iso = () => new Date().toISOString();

  /* AES-GCM 256 */
  const newKey = () => crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const exportKey = k => crypto.subtle.exportKey("raw", k).then(toB64);

  /* HMAC-SHA-512 */
  async function hmac(data, secret) {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    return Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) return form.reportValidity();
    if (form.hp && form.hp.value) return; // honeypot

    document.getElementById("encrypting-msg").classList.remove("hide");

    // reCAPTCHA v3
    let token = "";
    try {
      token = await grecaptcha.execute("YOUR_SITE_KEY", { action: "contact" });
    } catch {
      alert("reCAPTCHA error");
      return;
    }

    const key = await newKey();
    const keyB64 = await exportKey(key);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivB64 = toB64(iv);

    // Build plaintext object
    const plain = {
      id: uuid(),
      ts: iso(),
      name: clean(form.name.value),
      email: clean(form.email.value),
      service: clean(form.service.value),
      msg: clean(form.message.value)
    };

    // Encrypt plaintext
    const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(plain)));
    const blobB64 = toB64(cipher);

    // Metadata
    const meta = { iv: ivB64, key: keyB64, recaptcha: token };
    const sig = await hmac(JSON.stringify(meta) + blobB64, "CLIENT_SIDE_SECRET"); // replace

    try {
      const res = await fetch("https://script.google.com/macros/s/YOUR_ID/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ meta, blob: blobB64, hmac: sig })
      });
      const ok = res.ok;
      document.getElementById("feedback-msg").textContent = ok
        ? "Thank you – we’ll reply soon."
        : "Error, please retry.";
      if (ok) form.reset();
    } catch (err) {
      document.getElementById("feedback-msg").textContent = "Network error.";
    } finally {
      document.getElementById("encrypting-msg").classList.add("hide");
    }
  });

  // ----- LANGUAGE HANDLER FOR CONTACT FORM -----
  function updateTextByLang() {
    const currentLang = document.documentElement.lang;
    // placeholders
    document.querySelectorAll("input[data-en][data-es], textarea[data-en][data-es]").forEach(el => {
      el.placeholder = el.dataset[currentLang];
    });
    // text nodes (labels, buttons)
    document.querySelectorAll("[data-en][data-es]").forEach(el => {
      if (!["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(el.tagName)) {
        el.textContent = el.dataset[currentLang];
      }
    });
  }
  updateTextByLang();
  document.getElementById("lang-toggle")?.addEventListener("click", updateTextByLang);
})();
