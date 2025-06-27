// js/join_us.js
// Handles logic for the Join Us Modal within index.html

function initializeJoinUsModal(modalElement) {
    if (!modalElement) {
        console.error("ERROR:initializeJoinUsModal: Modal element not provided for Join Us.");
        return;
    }

    // Get current language from main.js (assuming it's globally available or accessible)
    // For simplicity, this example assumes `currentLanguage` is a global or can be fetched.
    // A more robust solution would be custom events or a shared state manager.
    const currentLang = window.currentLanguage || localStorage.getItem("language") || "en";

    const joinForm = modalElement.querySelector('#join-us-form-modal');

    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(joinForm);
            const data = {};
            formData.forEach((value, key) => { data[key] = window.sanitizeInput ? window.sanitizeInput(value) : value; });
            console.log("INFO:JoinUsModal/submit: Form submitted (simulated). Data:", data);
            // alert(currentLang === 'es' ? 'Solicitud enviada (simulado).' : 'Application submitted (simulated).');
            // joinForm.reset(); // Optionally reset form
            // Consider closing the modal after submission:
            // modalElement.classList.remove('active');
            // if (window.lastFocusedElement) window.lastFocusedElement.focus();
        });
    } else {
        console.error("ERROR:initializeJoinUsModal: Join Us form (#join-us-form-modal) not found within the modal.");
    }

    modalElement.querySelectorAll('.form-section').forEach(section => {
        const addBtn = section.querySelector('.add');
        const removeBtn = section.querySelector('.remove');
        const acceptBtn = section.querySelector('.accept-btn');
        const editBtn = section.querySelector('.edit-btn');
        const inputsContainer = section.querySelector('.inputs');
        const titleElement = section.querySelector('h2');

        if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleElement) {
            console.warn("WARN:initializeJoinUsModal: Missing one or more dynamic section elements in:", section);
            return;
        }

        addBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'text';
            // For placeholder language, rely on main.js's updateDynamicContentLanguage
            // or ensure currentLanguage is accurately obtained from main.js scope.
            const activeLang = window.currentLanguage || localStorage.getItem("language") || "en";
            const titleEn = titleElement.dataset.en || 'info';
            const titleEs = titleElement.dataset.es || 'info';
            const placeholderEn = `Enter ${titleEn} info`;
            const placeholderEs = `Ingresa ${titleEs} info`;
            input.setAttribute('data-placeholder-en', placeholderEn);
            input.setAttribute('data-placeholder-es', placeholderEs);
            input.placeholder = activeLang === 'es' ? placeholderEs : placeholderEn;

            inputsContainer.appendChild(input);
            // If new elements with data attributes for language are added,
            // main.js's language updater might need to be re-run on this specific new element or its parent.
            if (window.updateDynamicContentLanguage) {
                 window.updateDynamicContentLanguage(input);
            }
        };

        removeBtn.onclick = () => {
            const allInputs = inputsContainer.querySelectorAll('input');
            if (allInputs.length) {
                inputsContainer.removeChild(allInputs[allInputs.length - 1]);
            }
        };

        acceptBtn.onclick = () => {
            const sectionInputs = inputsContainer.querySelectorAll('input');
            const activeLang = window.currentLanguage || localStorage.getItem("language") || "en";
            if (sectionInputs.length === 0) {
                console.warn(activeLang === 'es' ? 'User feedback: Agrega al menos una entrada.' : 'User feedback: Please add at least one entry.');
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
    console.log('INFO:JoinUsModal: Dynamic sections initialized for Join Us modal.');
}


document.addEventListener('DOMContentLoaded', () => {
    const joinUsModalElement = document.getElementById('join-us-modal');
    if (joinUsModalElement) {
        initializeJoinUsModal(joinUsModalElement);
        console.log('INFO:join_us.js/DOMContentLoaded: Join Us Modal script initialized and attached to modal.');

        // If the modal can be opened and closed, and elements are dynamically added,
        // language updates might need to be triggered when the modal becomes visible
        // or when dynamic content is added, if not handled by initializeJoinUsModal directly.
        // Example: Hook into modal opening if main.js provides a way, or use MutationObserver.
        // For now, initial language is set by main.js, and dynamic inputs get placeholders set.
    } else {
        console.warn('WARN:join_us.js/DOMContentLoaded: Join Us modal element (#join-us-modal) not found. Script will not run.');
    }
});
