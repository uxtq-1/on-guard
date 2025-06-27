// js/join_us.js
// Handles the Join Us modal logic and form submission

document.addEventListener('DOMContentLoaded', () => {
    const joinUsModal = document.getElementById('join-us-modal');
    const fabJoin = document.getElementById('fab-join'); // Trigger for Join Us modal
    const joinForm = document.getElementById('join-form');
    const closeBtn = joinUsModal ? joinUsModal.querySelector('.close-modal[data-close]') : null;

    if (!joinUsModal || !fabJoin || !joinForm) {
        console.warn("Join Us modal, trigger, or form structure not found in HTML.");
        return;
    }

    // Modal open logic
    fabJoin.addEventListener('click', () => {
        joinUsModal.classList.add('active');
        const firstInput = joinForm.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    });

    // Modal close logic
    function closeJoinUsModal() {
        joinUsModal.classList.remove('active');
        fabJoin.focus();
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeJoinUsModal);
    }

    // Click outside to close
    joinUsModal.addEventListener('click', (e) => {
        if (e.target === joinUsModal) closeJoinUsModal();
    });

    // ESC key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && joinUsModal.classList.contains('active')) {
            closeJoinUsModal();
        }
    });

    // --- Form submission logic (basic placeholder) ---
    joinForm.addEventListener('submit', function (event) {
        event.preventDefault();
        // Add your form submission AJAX logic here
        alert('Join Us form submission is not implemented in this version. Data logged to console if needed.');
        // Optionally reset form
        // joinForm.reset();
        closeJoinUsModal();
    });
});
