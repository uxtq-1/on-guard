// join-us-modal/join-us-modal.js
// Handles Join Us modal dynamic interaction securely

import { attachModalHandlers } from '../js/core/modal-handler.js';

function initializeJoinUsModal(modalElement) {
    if (!modalElement) return console.error("ERROR:join_us/initializeJoinUsModal: Modal element not provided.");

    let currentLang = localStorage.getItem("language") || "en";

    const joinForm = modalElement.querySelector('#join-us-form-modal');
    if (!joinForm) return console.error("ERROR:join_us: #join-us-form-modal not found.");

    // Enable closing via buttons, overlay click and Escape key
    attachModalHandlers(modalElement);

    joinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(joinForm);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });

        // Optional: Simulate submission (fetch/worker/etc.)

        const feedback = modalElement.querySelector('.join-us-feedback');
        if (feedback) {
            feedback.textContent = currentLang === 'es'
                ? '¡Enviado! Gracias por unirte a nosotros.'
                : 'Submitted! Thank you for joining us.';
            feedback.style.display = 'block';
            setTimeout(() => { feedback.style.display = 'none'; }, 2500);
        }
        // joinForm.reset(); // Optionally reset
    });

    // Dynamic form sections (Skills, Education, etc.)
    modalElement.querySelectorAll('.form-section[data-section]').forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs');
        const titleElement = section.querySelector('h4');

        if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleElement) {
            console.warn("WARN:join_us: Incomplete form-section.", section);
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

            if (typeof window.updateDynamicContentLanguage === 'function') {
                window.updateDynamicContentLanguage(input);
            }

            inputsContainer.appendChild(input);
            input.focus();
        };

        removeBtn.onclick = () => {
            const inputs = inputsContainer.querySelectorAll('input');
            if (inputs.length) {
                inputsContainer.removeChild(inputs[inputs.length - 1]);
            }
        };

        acceptBtn.onclick = () => {
            const inputs = inputsContainer.querySelectorAll('input');
            if (!inputs.length) {
                showSectionFeedback(section, currentLang === 'es'
                    ? 'Por favor, agrega al menos una entrada.'
                    : 'Please add at least one entry.');
                return;
            }
            inputs.forEach(i => i.disabled = true);
            acceptBtn.classList.add('hidden');
            editBtn.classList.remove('hidden');
            section.classList.add('completed');
        };

        editBtn.onclick = () => {
            const inputs = inputsContainer.querySelectorAll('input');
            inputs.forEach(i => i.disabled = false);
            acceptBtn.classList.remove('hidden');
            editBtn.classList.add('hidden');
            section.classList.remove('completed');
            if (inputs[0]) inputs[0].focus();
        };
    });

    // Multilingual refresh on load
    if (typeof window.updateDynamicContentLanguage === 'function') {
        window.updateDynamicContentLanguage(modalElement);
    }

    // Feedback helper
    function showSectionFeedback(section, msg) {
        let fb = section.querySelector('.section-feedback');
        if (!fb) {
            fb = document.createElement('div');
            fb.className = 'section-feedback';
            fb.style.cssText = 'color:#c00;font-size:0.9em;margin-top:4px;';
            section.appendChild(fb);
        }
        fb.textContent = msg;
        fb.style.display = 'block';
        setTimeout(() => { fb.style.display = 'none'; }, 2500);
    }
}

export { initializeJoinUsModal };

// Auto-init if modal is present inline without placeholder injection
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('join-us-modal');
    const placeholder = document.getElementById('join-us-modal-placeholder');
    if (modal && !placeholder) initializeJoinUsModal(modal);
});
