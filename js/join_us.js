// js/join_us.js
// Handles modal, language, and theme toggles for join_us.html

document.addEventListener('DOMContentLoaded', () => {
    // Modal close logic
    const joinUsModal = document.getElementById('join-us-modal');
    const closeJoinUsModal = document.getElementById('close-join-us-modal');
    const fabJoin = document.getElementById('fab-join');
    let lastFocusedElement = null;

    if (fabJoin && joinUsModal) {
        fabJoin.addEventListener('click', () => {
            lastFocusedElement = fabJoin;
            joinUsModal.classList.add('active');
            // Focus first input if available
            const focusInput = joinUsModal.querySelector('input:not([type="hidden"]), select, textarea, button');
            if (focusInput) focusInput.focus();
        });
    }

    if (closeJoinUsModal && joinUsModal) {
        closeJoinUsModal.addEventListener('click', () => {
            joinUsModal.classList.remove('active');
            if (lastFocusedElement) lastFocusedElement.focus();
        });
    }

    // Close modal on outside click
    if (joinUsModal) {
        joinUsModal.addEventListener('click', (e) => {
            if (e.target === joinUsModal) {
                joinUsModal.classList.remove('active');
                if (lastFocusedElement) lastFocusedElement.focus();
            }
        });
    }

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && joinUsModal && joinUsModal.classList.contains('active')) {
            joinUsModal.classList.remove('active');
            if (lastFocusedElement) lastFocusedElement.focus();
        }
    });

    // Language toggle for Join Us page (uses global if available)
    const joinUsLangToggle = document.getElementById('join-us-lang-toggle');
    let currentLanguage = localStorage.getItem("language") || "en";
    function updateJoinUsLanguage(lang) {
        document.documentElement.lang = lang;
        //
