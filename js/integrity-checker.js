// Function to compute SHA-512 hash of a file
async function getFileHash(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);

        const content = await response.text();
        const hashBuffer = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(content));

        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    } catch (error) {
        console.error(`Error hashing ${url}:`, error);
        return null; // Returning null ensures we can handle failure in verification
    }
}

// Function to verify file integrity
async function verifyFiles() {
    try {
        const response = await fetch('/integrity.json');
        if (!response.ok) throw new Error("Failed to load integrity file.");
        
        const integrityData = await response.json();
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

        // Verify all files in parallel
        const verificationResults = await Promise.all(filesToCheck.map(async (file) => {
            const expectedHash = integrityData[file];
            if (!expectedHash) {
                console.warn(`No hash found for ${file}`);
                return true; // Ignore check if no hash is defined
            }

            const actualHash = await getFileHash(file);
            if (!actualHash || actualHash !== expectedHash) {
                console.error(`🚨 Integrity check failed for ${file}`);
                return false;
            }
            return true;
        }));

        // If any file fails, trigger lockdown
        if (verificationResults.includes(false)) {
            securityLockdown();
            throw new Error("Integrity verification failed. Execution halted.");
        }

        console.log("✅ All files passed integrity check.");
        loadResources(); // Load assets only if all files pass verification

    } catch (error) {
        console.error("Integrity check error:", error);
        securityLockdown(); // Call lockdown in case of an error
    }
}

// Function to halt execution and lock down the page
function securityLockdown() {
    document.body.innerHTML = `
        <h1 style="color: red; text-align: center;">
            🚨 Security Alert: Webpage has been tampered with! 🚨<br>
            ⚠️ Advertencia de seguridad: Página web manipulada ⚠️
        </h1>`;
    throw new Error("Critical Security Failure: Execution stopped.");
}

// Function to dynamically load CSS & JS (only if integrity check passes)
function loadResources() {
    const resources = {
        css: ["ops/css/global.css", "ops/css/small-screen.css"],
        js: ["ops/js/main.js", "ops/js/worker.js"]
    };

    resources.css.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
        }
    });

    resources.js.forEach(src => {
        if (!document.querySelector(`script[src="${src}"]`)) {
            const script = document.createElement("script");
            script.src = src;
            document.body.appendChild(script);
        }
    });
}

// Run the integrity check on page load
verifyFiles();
