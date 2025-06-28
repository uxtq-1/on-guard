// js/join_us.js
// Handles logic for the Join Us modal (dynamically loaded from join_us_modal.html)

function initializeJoinUsModal(modalElement) {
    if (!modalElement) {
        console.error("ERROR:join_us/initializeJoinUsModal: Modal element not provided.");
        return;
    }

    let currentLang = localStorage.getItem("language") || "en";

    const joinForm = modalElement.querySelector('#join-us-form-modal');
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(joinForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            // Simulate submission (AJAX, fetch, etc. can be added here)
            console.log(currentLang === 'es'
                ? 'INFO:join_us/submit: Formulario "Únete a Nosotros" enviado (simulado).'
                : 'INFO:join_us/submit: Join Us Form submitted (simulated).');
            console.log("INFO:join_us/submit: Join Us Form data:", data);

            // Feedback to user (success message)
            const feedbackArea = modalElement.querySelector('.join-us-feedback');
            if (feedbackArea) {
                feedbackArea.textContent = currentLang === 'es'
                    ? '¡Enviado! Gracias por unirte a nosotros.'
                    : 'Submitted! Thank you for joining us.';
                feedbackArea.style.display = 'block';
                setTimeout(() => {
                    feedbackArea.style.display = 'none';
                }, 2500);
            }
            // Optionally reset form:
            // joinForm.reset();
        });
    } else {
        console.error("ERROR:join_us/initializeJoinUsModal: #join-us-form-modal not found.");
    }

    // Handle dynamic sections (Skills, Education, etc.)
    modalElement.querySelectorAll('.form-section').forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs');
        const titleElement = section.querySelector('h4');

        if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleElement) {
            console.warn("WARN:join_us/initDynamicSections: Missing elements in a dynamic form section.", section);
            return;
        }

        addBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'text';
            const titleEn = titleElement.dataset.en || 'info';
            const titleEs = titleElement.dataset.es || 'info';
            input.placeholder = currentLang === 'es'
                ? `Ingresa ${titleEs} info`
                : `Enter ${titleEn} info`;
            input.setAttribute('data-en-placeholder', `Enter ${titleEn} info`);
            input.setAttribute('data-es-placeholder', `Ingresa ${titleEs} info`);
            if (window.updateDynamicContentLanguage) {
                window.updateDynamicContentLanguage(input);
            }
            inputsContainer.appendChild(input);
            input.focus();
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
                // Feedback for no entries
                const msg = currentLang === 'es'
                    ? 'Por favor, agrega al menos una entrada.'
                    : 'Please add at least one entry.';
                showSectionFeedback(section, msg);
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

    // Initial language update for modal content
    if (typeof window.updateDynamicContentLanguage === 'function') {
        window.updateDynamicContentLanguage(modalElement);
    } else {
        console.warn("WARN:join_us/initializeJoinUsModal: window.updateDynamicContentLanguage not found.");
    }

    // Optional helper: Section-level feedback
    function showSectionFeedback(section, msg) {
        let feedback = section.querySelector('.section-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'section-feedback';
            feedback.style.color = '#c00';
            feedback.style.fontSize = '0.9em';
            feedback.style.marginTop = '4px';
            section.appendChild(feedback);
        }
        feedback.textContent = msg;
        feedback.style.display = 'block';
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 2500);
    }

    console.log('INFO:join_us/initializeJoinUsModal: Join Us modal initialized.');
}

// Make initializer available globally for main.js
window.initializeJoinUsModal = initializeJoinUsModal;
