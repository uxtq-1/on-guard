const translations = {
    en: {
        "Contact Us": "Contact Us",
        "Name": "Name",
        "Email": "Email",
        "Message": "Message",
        "Send Message": "Send Message",
        "Contáctanos": "Contact Us" // Added for reverse lookup if needed
    },
    es: {
        "Contact Us": "Contáctanos",
        "Name": "Nombre",
        "Email": "Correo Electrónico",
        "Message": "Mensaje",
        "Send Message": "Enviar Mensaje",
        "Contáctanos": "Contáctanos" // Ensure Spanish title maps to itself
    }
};

function switchLanguage(lang) {
    document.querySelectorAll('[data-en]').forEach(el => {
        const key = el.dataset.en; // Use English text as key
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    // Update title specifically if it's tagged
    const pageTitle = document.querySelector('h1[data-en]');
    if (pageTitle) {
         const titleKey = pageTitle.dataset.en;
         if(translations[lang] && translations[lang][titleKey]){
            pageTitle.textContent = translations[lang][titleKey];
         }
    }
}

document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    alert('Form submitted!'); // Placeholder for actual submission
});

// Initialize with English
// switchLanguage('en'); // Removed: Relies on global language initialization
