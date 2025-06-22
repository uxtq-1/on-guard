// join-us-form.js - Script for the NEW Join Us Modal with dynamic HTML loading

(function() {
    const joinModalOverlay = document.getElementById('join-modal');
    if (!joinModalOverlay) {
        // console.warn('Join Us modal overlay (#join-modal) not found. Cannot initialize form.');
        return;
    }
    const placeholder = joinModalOverlay.querySelector('.join-modal-content-placeholder');
    let isModalContentLoaded = false;

    function initializeJoinModalLogic() {
        // This function is called AFTER the snippet is loaded into the placeholder.
        // It assumes #join-modal and its *newly injected* content are available.
        const joinModalContent = joinModalOverlay.querySelector('.modal-content');
        if (!joinModalContent) {
            // console.warn('Join Us modal content not found after attempting to load snippet.');
            return;
        }

        let currentLang = 'en'; // Default language
        const langToggleBtn = joinModalContent.querySelector('.lang-toggle');
        const joinForm = joinModalContent.querySelector('#join-form');
        const pageTitleElement = document.querySelector('title[data-en]');

        if (!langToggleBtn || !joinForm) {
            // console.warn("Required elements within .modal-content (.lang-toggle or #join-form) not found.");
            return;
        }

        function updateTextsForLanguage() {
            joinModalContent.querySelectorAll('[data-en]').forEach(el => {
                const text = el.getAttribute(`data-${currentLang}`);
                if (text !== null && el !== langToggleBtn) el.textContent = text;
            });
            joinModalContent.querySelectorAll('input[data-placeholder-en], textarea[data-placeholder-en]').forEach(el => {
                const placeholder = el.getAttribute(`data-placeholder-${currentLang}`);
                if (placeholder !== null) el.placeholder = placeholder;
            });
            if (langToggleBtn) {
                langToggleBtn.textContent = currentLang === 'en' ? 'EN | ES' : 'ES | EN';
            }
            if (pageTitleElement) {
                const titleText = pageTitleElement.getAttribute(`data-${currentLang}`);
                if (titleText !== null) document.title = titleText;
            }
        }

        function toggleLangHandler() {
            currentLang = currentLang === 'en' ? 'es' : 'en';
            updateTextsForLanguage();
        }

        langToggleBtn.addEventListener('click', toggleLangHandler);
        currentLang = 'es';
        toggleLangHandler();

        joinModalContent.querySelectorAll('.form-section').forEach(section => {
            const addBtn = section.querySelector('.add');
            const removeBtn = section.querySelector('.remove');
            const acceptBtn = section.querySelector('.accept-btn');
            const editBtn = section.querySelector('.edit-btn');
            const inputsContainer = section.querySelector('.inputs');
            const sectionName = section.dataset.section;
            const sectionTitleH2 = section.querySelector('.section-header h2');

            if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer) {
                return;
            }

            addBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'text';
                const currentSectionTitleText = sectionTitleH2 ? (sectionTitleH2.getAttribute(`data-${currentLang}`) || sectionTitleH2.textContent.trim()) : sectionName;
                input.placeholder = currentLang === 'es' ? `Ingresa ${currentSectionTitleText}` : `Enter ${currentSectionTitleText}`;
                inputsContainer.appendChild(input);
            });

            removeBtn.addEventListener('click', () => {
                const inputs = inputsContainer.querySelectorAll('input[type="text"]');
                if (inputs.length > 0) {
                    inputsContainer.removeChild(inputs[inputs.length - 1]);
                }
            });

            acceptBtn.addEventListener('click', () => {
                const inputs = inputsContainer.querySelectorAll('input[type="text"]');
                let allFilled = true;
                if (inputs.length === 0 && !section.classList.contains('optional-section')) {
                    allFilled = false;
                }
                inputs.forEach(input => {
                    if (input.value.trim() === '') allFilled = false;
                });

                if (!allFilled) {
                    const currentSectionTitleText = sectionTitleH2 ? (sectionTitleH2.getAttribute(`data-${currentLang}`) || sectionTitleH2.textContent.trim()) : sectionName;
                    alert(currentLang === 'es' ? `Por favor, completa todos los campos en ${currentSectionTitleText} o agrega al menos una entrada.` : `Please fill all fields in ${currentSectionTitleText}, or add at least one entry.`);
                    return;
                }
                inputs.forEach(input => input.disabled = true);
                section.classList.add('completed');
                acceptBtn.style.display = 'none';
                editBtn.style.display = 'inline-block';
            });

            editBtn.addEventListener('click', () => {
                const inputs = inputsContainer.querySelectorAll('input[type="text"]');
                inputs.forEach(input => input.disabled = false);
                section.classList.remove('completed');
                acceptBtn.style.display = 'inline-block';
                editBtn.style.display = 'none';
            });
        });

        joinForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let allSectionsCompleted = true;
            joinModalContent.querySelectorAll('.form-section:not(.optional-section)').forEach(section => {
                if (!section.classList.contains('completed')) {
                    allSectionsCompleted = false;
                    const sectionTitleH2 = section.querySelector('.section-header h2');
                    const sectionTitle = sectionTitleH2 ? (sectionTitleH2.getAttribute(`data-${currentLang}`) || sectionTitleH2.textContent.trim()) : section.dataset.section;
                    alert(currentLang === 'es' ? `Por favor, completa y acepta la sección: ${sectionTitle}` : `Please complete and accept the section: ${sectionTitle}`);
                }
            });
            if (allSectionsCompleted) {
                alert(currentLang === 'es' ? 'Formulario enviado (simulado)!' : 'Form submitted (simulated)!');
            }
        });
    }

    function loadModalContentAndInitialize() {
        if (isModalContentLoaded || !placeholder) return; // Already loaded or no placeholder

        fetch('join_docs/join-us-modal-snippet.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} while fetching join-us-modal-snippet.html`);
                }
                return response.text();
            })
            .then(html => {
                placeholder.innerHTML = html;
                isModalContentLoaded = true;
                initializeJoinModalLogic(); // Now initialize the logic on the new content
            })
            .catch(error => {
                console.error("Failed to load Join Us modal content:", error);
                if (placeholder) placeholder.innerHTML = "<p>Error loading modal content.</p>";
            });
    }

    // How to trigger loadModalContentAndInitialize?
    // Option 1: Load when this script runs (effectively on page load as it's deferred)
    // Option 2: Expose loadModalContentAndInitialize and have js/main.js call it
    //           right before it shows the #join-modal overlay. This is better for true on-demand.
    // Option 3: Use MutationObserver on #join-modal to detect when it becomes visible.

    // For now, let's go with Option 1 (load on script execution).
    // This means the snippet is fetched when the page loads.
    // If true on-demand (on first click) is needed, this needs coordination with your main.js

    // Ensure DOM is ready before trying to find the placeholder for initial load.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadModalContentAndInitialize);
    } else {
        loadModalContentAndInitialize();
    }

    // Expose a function that your js/main.js could call IF it needs to explicitly trigger content load
    // This is useful if js/main.js controls modal visibility and can call this before showing.
    window.ensureJoinUsModalContentLoaded = loadModalContentAndInitialize;

})();
