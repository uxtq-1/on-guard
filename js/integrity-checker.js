async function verifyFiles() {
    try {
        const response = await fetch('/integrity.json');
        if (!response.ok) throw new Error("Failed to load integrity file.");

        const integrityData = await response.json();

        // >>>> Function to get the hash of a file <<<<<

        async function getFileHash(url) {
            const fileResponse = await fetch(url);
            const content = await fileResponse.text();
            const encoder = new TextEncoder();
            const data = encoder.encode(content);
            const hashBuffer = await crypto.subtle.digest('SHA-512', data);
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        // >>>> List of all files in your structure to check (HTML, CSS, JS) <<<<<


        const filesToCheck = [
            'ops/index.html',
            'ops/business-operations.html',
            'ops/contact-center.html',
            'ops/it-support.html',
            'ops/professionals.html',
            'ops/css/global.css',
            'ops/css/small-screen.css',
            'ops/js/main.js',
            'ops/js/worker.js'
        ];

        // >>>> Verify each file against the expected hash <<<<<


        for (const file of filesToCheck) {
            const expectedHash = integrityData[file];

            if (!expectedHash) {
                console.error(`No hash found for ${file}`);
                continue;
            }

            const actualHash = await getFileHash(file);
            if (actualHash !== expectedHash) {
                console.error(`🚨 Integrity check failed for ${file}`);
                
                // >>>> Display tampering message <<<<<


                document.body.innerHTML = `<h1>Security Warning: Webpage tampered with!
                ¡Advertencia de seguridad: Página web manipulada!</h1>`;
                document.getElementById('integrity-message').style.display = 'block'; 
                return;
            }
        }

        console.log("✅ All files passed integrity check.");

        // >>>> Dynamically load CSS & JS after verification <<<<<


        loadResources();

    } catch (error) {
        console.error("Integrity check error:", error);
        document.body.innerHTML = "<h1>Security Error: Unable to verify integrity.</h1>";
    }
}

// >>>> Function to load CSS & JS dynamically after the integrity check passes
function loadResources() {
    const cssFiles = ["ops/css/global.css", "ops/css/small-screen.css"];
    const jsFiles = ["ops/js/main.js", "ops/js/worker.js"];

    cssFiles.forEach(css => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = css;
        document.head.appendChild(link);
    });

    jsFiles.forEach(js => {
        const script = document.createElement("script");
        script.src = js;
        document.body.appendChild(script);
    });
}

// >>>> Run the integrity check on page load
verifyFiles();
