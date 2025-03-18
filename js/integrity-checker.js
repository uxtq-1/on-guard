async function verifyFiles() {
    try {
        const response = await fetch('/integrity.json');
        if (!response.ok) throw new Error("Failed to load integrity file.");

        const integrityData = await response.json();

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

        for (const [file, expectedHash] of Object.entries(integrityData)) {
            if (file.startsWith('./')) continue; // Remove leading "./" from paths

            const actualHash = await getFileHash(file);
            if (actualHash !== expectedHash) {
                console.error(`🚨 Integrity check failed for ${file}`);
                document.body.innerHTML = `<h1>Security Warning: File tampered with!</h1>`;
                return;
            }
        }

        console.log("✅ All files passed integrity check.");

        // Dynamically load CSS & JS after verification
        loadResources();

    } catch (error) {
        console.error("Integrity check error:", error);
        document.body.innerHTML = "<h1>Security Error: Unable to verify integrity.</h1>";
    }
}

function loadResources() {
    const cssFiles = ["css/global.css", "css/small-screen.css"];
    const jsFiles = ["js/main.js", "js/worker.js"];

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

// Run verification on page load
verifyFiles();
