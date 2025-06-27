// js/join_us.js - Handles Join Us modal form logic

document.addEventListener("DOMContentLoaded", () => {
  console.log('INFO:JoinUs/DOMContentLoaded: Initializing Join Us modal logic.');

  const joinUsForm = document.getElementById("join-form");
  const honeypotField = joinUsForm ? joinUsForm.querySelector("[name='join-honeypot']") : null;
  const submitButton = joinUsForm?.querySelector("button[type='submit']");

  if (!joinUsForm) {
    console.error("ERROR:JoinUs/DOMContentLoaded: Join Us form element not found.");
    return;
  }

  // Validate form fields (basic)
  function validateJoinUsForm() {
    const nameField = joinUsForm.querySelector("[name='name']");
    const emailField = joinUsForm.querySelector("[name='email']");
    const positionField = joinUsForm.querySelector("[name='position']");
    const acceptedTerms = joinUsForm.querySelector("[name='terms']");

    if (!nameField || !emailField || !positionField || !acceptedTerms) {
      console.error("ERROR:JoinUs/validateJoinUsForm: One or more expected fields are missing.");
      return false;
    }

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const position = positionField.value.trim();
    const termsAccepted = acceptedTerms.checked;

    if (!name || !email || !position || !termsAccepted) {
      alert("Please complete all required fields and accept the terms.");
      return false;
    }

    // Email pattern check (basic)
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  }

  // Sanitize input client-side before sending
  function sanitizeInput(input) {
    return window.sanitizeInput ? window.sanitizeInput(input) : input;
  }

  joinUsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (honeypotField && honeypotField.value !== "") {
      console.warn("WARN:JoinUs/FormSubmit: Honeypot triggered. Bot submission suspected.");
      return;
    }

    if (!validateJoinUsForm()) {
      console.warn("WARN:JoinUs/FormSubmit: Validation failed.");
      return;
    }

    const formData = new FormData(joinUsForm);
    const sanitizedData = {};

    for (const [key, value] of formData.entries()) {
      sanitizedData[key] = sanitizeInput(value);
    }

    // Simulate a successful form submission
    console.log("INFO:JoinUs/FormSubmit: Sanitized form data ready for processing:", sanitizedData);

    alert("Thank you for joining us! Your application has been submitted.");
    joinUsForm.reset();
  });

  console.log("INFO:JoinUs/DOMContentLoaded: Join Us form logic initialized.");
});
