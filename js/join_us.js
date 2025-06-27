// js/join_us.js
// Handles logic for the Join Us modal (dynamically loaded from join_us_modal.html)

function initializeJoinUsModal(modalElement) {
    if (!modalElement) {
        console.error("ERROR:join_us/initializeJoinUsModal: Modal element not provided.");
        return;
    }

    let currentLang = localStorage.getItem("language") || "en";
    // Theme is handled globally by main.js

    const joinForm = modalElement.querySelector('#join-us-form-modal');

    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log(currentLang === 'es' ? 'INFO:join_us/submit: Formulario "Únete a Nosotros" enviado (simulado).' : 'INFO:join_us/submit: Join Us Form submitted (simulated).');
            const formData = new FormData(joinForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            console.log("INFO:join_us/submit: Join Us Form data:", data);
            // Optionally reset form: joinForm.reset();
            // Optionally close modal: modalElement.classList.remove('active');
            // Consider giving user feedback on submission.
        });
    } else {
        console.error("ERROR:join_us/initializeJoinUsModal: Join Us form (#join-us-form-modal) not found in modalElement.");
    }

    // Dynamic Form Sections (Skills, Education, etc.)
    // Ensure querySelectorAll is called on modalElement to scope it correctly.
    modalElement.querySelectorAll('.form-section').forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs');
        const titleElement = section.querySelector('h4'); // Changed from h2 to h4 in modal HTML

        if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleElement) {
            console.warn("WARN:join_us/initDynamicSections: Missing elements in a dynamic form section.", section);
            return;
        }

        // Update current language for placeholder text generation
        currentLang = localStorage.getItem("language") || "en";

        addBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'text';
            const titleEn = titleElement.dataset.en || 'info';
            const titleEs = titleElement.dataset.es || 'info';
            const placeholderEn = `Enter ${titleEn} info`;
            const placeholderEs = `Ingresa ${titleEs} info`;
            input.setAttribute('data-placeholder-en', placeholderEn);
            input.setAttribute('data-placeholder-es', placeholderEs);
            input.placeholder = currentLang === 'es' ? placeholderEs : placeholderEn;
            // Apply global language update to this new input if window.updateDynamicContentLanguage exists
            if (window.updateDynamicContentLanguage) {
                 window.updateDynamicContentLanguage(input);
            }
            inputsContainer.appendChild(input);
        };

        removeBtn.onclick = () => {
            const allInputs = inputsContainer.querySelectorAll('input');
            if (allInputs.length) {
                inputsContainer.removeChild(allInputs[allInputs.length - 1]);
            }
        };

        acceptBtn.onclick = () => {
            const sectionInputs = inputsContainer.querySelectorAll('input');
            if (sectionInputs.length === 0) {
                // TODO: Provide user feedback (e.g., via a status message area in the modal)
                console.warn(currentLang === 'es' ? 'User feedback: Agrega al menos una entrada.' : 'User feedback: Please add at least one entry.');
                return;
            }
            sectionInputs.forEach(input => input.disabled = true);
            acceptBtn.style.display = 'none';
            editBtn.style.display = 'inline-block';
            section.classList.add('completed');
        };

        editBtn.onclick = () => {
            inputsContainer.querySelectorAll('input').forEach(input => input.disabled = false);
            acceptBtn.style.display = 'inline-block';
            editBtn.style.display = 'none';
            section.classList.remove('completed');
            const firstInput = inputsContainer.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        };
    });

    // Initial language update for the modal content when it's initialized
    if (window.updateDynamicContentLanguage) {
        window.updateDynamicContentLanguage(modalElement);
    } else {
        console.warn("WARN:join_us/initializeJoinUsModal: window.updateDynamicContentLanguage not found. Modal language may not be up to date.");
    }

    console.log('INFO:join_us/initializeJoinUsModal: Join Us modal initialized.');
}

// The actual loading and display of the modal will be handled by main.js
// This script (join_us.js) will be called upon to initialize the modal's specific JS functionalities
// once its HTML is loaded into the DOM.
// Example of how it might be triggered from main.js after loading HTML:
// if (modalId === 'join-us-modal' && typeof initializeJoinUsModal === 'function') {
//   initializeJoinUsModal(targetModalElement);
// }
