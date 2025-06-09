// js/form-encryptor.js
// Module for handling secure form submissions with AES-GCM encryption.

const FormEncryptor = (() => {
'use strict';

    // --- Configuration ---
    // SERVER-SIDE TODO: ADMINISTRATOR MUST PROVIDE A VALID RSA-OAEP PUBLIC KEY PEM STRING HERE.
    // This key is used to encrypt (wrap) the AES session key before sending it to the backend.
    // If this key is not provided, the AES session key will be sent in raw format, WHICH IS INSECURE.
    // --- IMPORTANT SECURITY WARNING ---
    // THE `BACKEND_PUBLIC_KEY_PEM` CONSTANT BELOW IS CRITICAL FOR SECURE OPERATION.
    // IT MUST BE REPLACED WITH THE ACTUAL RSA PUBLIC KEY (in PEM format) FROM YOUR BACKEND SERVER.
    //
    // IF THIS KEY IS EMPTY OR NOT A VALID PUBLIC KEY CORRESPONDING TO THE BACKEND'S PRIVATE KEY:
    // - THE AES SESSION KEY (used to encrypt form data) WILL BE SENT TO THE BACKEND
    //   IN RAW, UNENCRYPTED FORM.
    // - THIS COMPLETELY NEGATES THE CONFIDENTIALITY OF THE CLIENT-SIDE ENCRYPTION.
    //
    // DO NOT DEPLOY TO PRODUCTION WITHOUT SETTING A VALID BACKEND PUBLIC KEY HERE.
    // CONSULT YOUR BACKEND ADMINISTRATOR OR SECURITY TEAM FOR THE CORRECT KEY.
    // --- END IMPORTANT SECURITY WARNING ---
    const BACKEND_PUBLIC_KEY_PEM = '';
    // For demonstration, a placeholder is used. In a real scenario, this must be a valid key.
    // Ensure the key is properly formatted and accessible.

    // --- Utility Functions ---

    // Generate cryptographically secure UUID v4
    function generateSecureUUID() {
        const cryptoObj = window.crypto || window.msCrypto; // For IE11 compatibility
        if (!cryptoObj || !cryptoObj.getRandomValues) {
            console.error("Cryptography API not supported, cannot generate secure UUID.");
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        const bytes = new Uint8Array(16);
        cryptoObj.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
        bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant: 10xx
        const hexBytes = [...bytes].map(b => b.toString(16).padStart(2, "0"));
        return [
            hexBytes.slice(0, 4).join(""),
            hexBytes.slice(4, 6).join(""),
            hexBytes.slice(6, 8).join(""),
            hexBytes.slice(8, 10).join(""),
            hexBytes.slice(10, 16).join("")
        ].join("-");
    }

    // Generate a random Initialization Vector (IV) for AES-GCM (12 bytes is recommended)
    function generateIV() {
        return window.crypto.getRandomValues(new Uint8Array(12));
    }

    // Generate an ISO format timestamp
    const generateTimestamp = () => new Date().toISOString();

    // Generate an AES-GCM 256-bit key for session encryption
    async function generateAESKey() {
        return window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true, // exportable
            ["encrypt", "decrypt"]
        );
    }

    // Export the raw AES key (e.g., to be encrypted with backend's public key)
    async function exportRawKey(key) {
        return window.crypto.subtle.exportKey("raw", key);
    }

    // Helper to convert PEM to ArrayBuffer
    function _pemToBinary(pem) {
        const base64Lines = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").trim();
        const base64 = base64Lines.replace(/\n/g, "");
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Encrypt AES session key with backend's RSA public key
    async function encryptAESKeyWithBackendPublicKey(aesKeyBuffer) {
        // IMPORTANT: Replace placeholder BACKEND_PUBLIC_KEY_PEM with actual server public key.
        if (!BACKEND_PUBLIC_KEY_PEM || BACKEND_PUBLIC_KEY_PEM.includes("...")) {
            console.warn("IMPORTANT: Backend public key not properly set. AES key will be transmitted in raw format. THIS IS INSECURE for production.");
            return aesKeyBuffer; // Return raw key if public key is not set
        }
        try {
            const publicKey = await window.crypto.subtle.importKey(
                "spki", // SubjectPublicKeyInfo format
                _pemToBinary(BACKEND_PUBLIC_KEY_PEM),
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            );
            return window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                aesKeyBuffer
            );
        } catch (error) {
            console.error("Failed to encrypt AES key with backend public key:", error);
            console.warn("Transmitting raw AES key due to encryption failure. THIS IS INSECURE.");
            return aesKeyBuffer; // Fallback to raw key on error
        }
    }

    // Encrypt data (string) using AES-GCM
    async function encryptData(aesKey, iv, jsonDataString) {
        const encodedData = new TextEncoder().encode(jsonDataString);
        return window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            encodedData
        );
    }

    // Encrypt file (ArrayBuffer) using AES-GCM
    async function encryptFile(aesKey, iv, fileArrayBuffer) {
        return window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            fileArrayBuffer
        );
    }

    // Convert ArrayBuffer to Base64 string
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Convert Base64 string to ArrayBuffer
    function _base64ToArrayBuffer(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // --- Main Public Method ---
    async function processForm(formElement, formType, siteKeyV3, backendUrl, specificAssetId = null) {
        // 1. Get ReCaptcha token
        const recaptchaToken = await new Promise((resolve, reject) => {
            if (typeof grecaptcha === 'undefined' || !grecaptcha.ready || !grecaptcha.execute) {
                console.error("ReCaptcha API not loaded.");
                return reject(new Error('ReCaptcha API not loaded.'));
            }
            grecaptcha.ready(function() {
                grecaptcha.execute(siteKeyV3, { action: 'submit_' + formType })
                    .then(resolve)
                    .catch(reject);
            });
        });
        if (!recaptchaToken) {
            throw new Error('ReCaptcha token generation failed.');
        }

        // 2. Collect Form Data
        const formDataObject = {};
        const filesToEncrypt = [];
        for (const element of formElement.elements) {
            if (element.name) {
                if (element.type === "file") {
                    if (element.files && element.files.length > 0) {
                        for (const file of element.files) {
                            filesToEncrypt.push(file);
                        }
                    }
                } else if (element.type === "radio" || element.type === "checkbox") {
                    if (element.checked) {
                        formDataObject[element.name] = DOMPurify.sanitize(element.value);
                    }
                } else {
                    formDataObject[element.name] = DOMPurify.sanitize(element.value);
                }
            }
        }

        // 3. Generate Crypto Materials
        const assetId = specificAssetId ? specificAssetId : generateSecureUUID();
        const timestamp = generateTimestamp();
        const sessionAESKey = await generateAESKey();
        const exportedKeyMaterial = await exportRawKey(sessionAESKey); // Raw AES key

        let encryptedSessionKeyPayload;
        try {
            encryptedSessionKeyPayload = await encryptAESKeyWithBackendPublicKey(exportedKeyMaterial);
        } catch (e) {
            console.warn('Failed to encrypt session key with backend public key due to error. Transmitting raw key. Error:', e);
            encryptedSessionKeyPayload = exportedKeyMaterial; // Fallback to raw key
        }

        const ivData = generateIV();

        // 4. Prepare Data Payload (excluding files for now)
        const payloadMetadata = { ...formDataObject, assetId, timestamp, formType };
        const encryptedData = await encryptData(sessionAESKey, ivData, JSON.stringify(payloadMetadata));

        // 5. Handle File Encryption
        const encryptedFilesDetails = [];
        if (formType === 'join' && filesToEncrypt.length > 0) {
            for (const file of filesToEncrypt) {
                const fileIv = generateIV();
                const fileArrayBuffer = await file.arrayBuffer();
                const encryptedFileContent = await encryptFile(sessionAESKey, fileIv, fileArrayBuffer);
                encryptedFilesDetails.push({
                    name: file.name,
                    type: file.type,
                    iv: arrayBufferToBase64(fileIv),
                    content: arrayBufferToBase64(encryptedFileContent) // Base64 for metadata, raw for FormData
                });
            }
        }

        // 6. Assemble Final Payload for Backend
        const finalPayload = new FormData();
        finalPayload.append('encryptedSessionKey', arrayBufferToBase64(encryptedSessionKeyPayload));
        finalPayload.append('dataIV', arrayBufferToBase64(ivData));
        finalPayload.append('encryptedData', arrayBufferToBase64(encryptedData));
        finalPayload.append('recaptchaToken', recaptchaToken);
        finalPayload.append('assetId', assetId);
        finalPayload.append('formType', formType);

        if (encryptedFilesDetails.length > 0) {
            const filesMetaForJson = encryptedFilesDetails.map(f => ({ name: f.name, type: f.type, iv: f.iv }));
            finalPayload.append('encryptedFilesMeta', JSON.stringify(filesMetaForJson));

            encryptedFilesDetails.forEach((fileDetail, index) => {
                const fileBlob = new Blob([_base64ToArrayBuffer(fileDetail.content)], { type: 'application/octet-stream' });
                finalPayload.append(`encryptedFile_${index}`, fileBlob, fileDetail.name);
            });
        }

        // 7. Send to Backend (Placeholder for now)
        /* console.log("Payload for backend:", {
            backendUrl,
            // Note: FormData entries cannot be easily logged directly in full detail for files.
            // We'll log what's easily stringifiable.
            encryptedSessionKey: finalPayload.get('encryptedSessionKey'),
            dataIV: finalPayload.get('dataIV'),
            encryptedData: finalPayload.get('encryptedData'),
            recaptchaToken: finalPayload.get('recaptchaToken'),
            assetId: finalPayload.get('assetId'),
            formType: finalPayload.get('formType'),
            encryptedFilesMeta: finalPayload.get('encryptedFilesMeta'),
            // Files themselves are harder to log concisely from FormData.
        }); */

        // Actual fetch (commented out for now as per instructions)
        // try {
        //     const response = await fetch(backendUrl, {
        //         method: 'POST',
        //         body: finalPayload
        //     });
        //     if (!response.ok) {
        //         const errorData = await response.text();
        //         throw new Error(`Server error: ${response.status} - ${errorData}`);
        //     }
        //     const responseData = await response.json();
        //     return responseData;
        // } catch (error) {
        //     console.error('Form submission error:', error);
        //     throw error;
        // }

        return {
            success: true,
            message: "Form data prepared for submission (see console for details).",
            payloadPreview: { // Provide a preview of non-file data
                encryptedSessionKey: finalPayload.get('encryptedSessionKey'),
                dataIV: finalPayload.get('dataIV'),
                encryptedData: finalPayload.get('encryptedData'),
                recaptchaToken: finalPayload.get('recaptchaToken'),
                assetId: finalPayload.get('assetId'),
                formType: finalPayload.get('formType'),
                encryptedFilesMeta: finalPayload.get('encryptedFilesMeta'),
            }
        };
    }

    // --- Public API ---
    return {
        generateSecureUUID,
        generateTimestamp,
        processForm, // Expose the main method
        // For testing/dev purposes - review for production
        _generateIV: generateIV,
        _generateAESKey: generateAESKey,
        _exportRawKey: exportRawKey,
        _encryptData: encryptData,
        _encryptFile: encryptFile,
        _arrayBufferToBase64: arrayBufferToBase64,
        _base64ToArrayBuffer: _base64ToArrayBuffer, // Expose if needed externally
        _encryptAESKeyWithBackendPublicKey: encryptAESKeyWithBackendPublicKey
    };

})();

// Example of how it might be used (for testing, to be removed or adapted)
// (async () => {
//     try {
//         // This is a placeholder for a form element. In a real scenario, you'd get this from the DOM.
//         const mockFormElement = {
//             elements: [
//                 { name: "email", value: "test@example.com", type: "email" },
//                 { name: "message", value: "Hello secure world!", type: "textarea"}
//             ]
//         };
//         // Replace with your actual ReCaptcha v3 site key and backend URL
//         const siteKeyV3 = 'YOUR_RECAPTCHA_V3_SITE_KEY';
//         const backendUrl = 'YOUR_BACKEND_ENDPOINT_URL';
//
//         // Mock grecaptcha if not running in a browser with the API loaded
//         if (typeof grecaptcha === 'undefined') {
//             window.grecaptcha = {
//                 ready: function(cb) { cb(); },
//                 execute: function(key, options) {
//                     console.log("Mock grecaptcha.execute called with key:", key, "options:", options);
//                     return Promise.resolve("mock_recaptcha_token_" + FormEncryptor.generateSecureUUID());
//                 }
//             };
//             // Mock DOMPurify if not loaded
//             if (typeof DOMPurify === 'undefined') {
//                 window.DOMPurify = { sanitize: (val) => val };
//             }
//         }
//
//         console.log("Testing FormEncryptor.processForm...");
//         const result = await FormEncryptor.processForm(mockFormElement, 'contact_test', siteKeyV3, backendUrl);
//         console.log("processForm test result:", result);
//
//     } catch (err) {
//         console.error("FormEncryptor processForm test error:", err);
//     }
// })();
