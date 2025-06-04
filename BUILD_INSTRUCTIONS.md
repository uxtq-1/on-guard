# Build Instructions: JavaScript Obfuscation

This document outlines how to set up JavaScript obfuscation for this project using `javascript-obfuscator`. Obfuscation can help make your client-side code more difficult to read and reverse-engineer, but it is not a foolproof security measure. Critical logic should always be server-side.

## 1. Installation

First, you need to have Node.js and npm installed. Then, install `javascript-obfuscator` as a development dependency for your project:

```bash
npm init -y  # If you don't have a package.json yet
npm install --save-dev javascript-obfuscator
```

## 2. Configuration

Create a configuration file for `javascript-obfuscator`, typically named `obfuscator.config.json` (or `.js`) in the project root. This file defines how the obfuscation will be applied.

Example `obfuscator.config.json`:
```json
{
    "compact": true,
    "controlFlowFlattening": true,
    "controlFlowFlatteningThreshold": 0.75,
    "deadCodeInjection": true,
    "deadCodeInjectionThreshold": 0.4,
    "debugProtection": false,
    "debugProtectionInterval": 0,
    "disableConsoleOutput": false, // Set to true for production to hide console.log outputs
    "identifierNamesGenerator": "hexadecimal",
    "log": false,
    "numbersToExpressions": true,
    "renameGlobals": false,
    "selfDefending": true,
    "simplify": true,
    "splitStrings": true,
    "splitStringsChunkLength": 10,
    "stringArray": true,
    "stringArrayCallsTransform": true,
    "stringArrayEncoding": ["base64"], // Can also use "rc4"
    "stringArrayIndexShift": true,
    "stringArrayRotate": true,
    "stringArrayShuffle": true,
    "stringArrayWrappersCount": 2,
    "stringArrayWrappersChainedCalls": true,
    "stringArrayWrappersParametersMaxCount": 4,
    "stringArrayWrappersType": "function",
    "stringArrayThreshold": 0.75,
    "transformObjectKeys": true,
    "unicodeEscapeSequence": false
}
```
*Note: Some of these settings can significantly increase file size or impact performance. Test thoroughly.*

## 3. Running Obfuscation

You can run the obfuscator from the command line. It's often useful to add scripts to your `package.json` for this.

**Example `package.json` scripts:**

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "scripts": {
    "obfuscate:js": "javascript-obfuscator ./js --output ./dist/js --config ./obfuscator.config.json",
    "obfuscate:main": "javascript-obfuscator ./js/main.js --output ./dist/js/main.obfuscated.js --config ./obfuscator.config.json",
    "obfuscate:form-encryptor": "javascript-obfuscator ./js/form-encryptor.js --output ./dist/js/form-encryptor.obfuscated.js --config ./obfuscator.config.json",
    // Add similar scripts for other JS files like contact-handler.js, join-handler.js
    "build": "npm run obfuscate:js" // Or list individual files
  },
  "devDependencies": {
    "javascript-obfuscator": "^4.0.0" // Or your installed version
  }
}
```

**To run obfuscation for all files in `./js` directory and output to `./dist/js`:**
```bash
npx javascript-obfuscator ./js --output ./dist/js --config ./obfuscator.config.json
```
Or, if you added it to `package.json` scripts:
```bash
npm run obfuscate:js
```

**Important Considerations:**
*   **Output Directory:** The examples above output to a `dist/js` directory. You would then need to update your HTML files to point to these obfuscated scripts in your production deployment. This usually involves having a build step that also copies HTML files to the `dist` folder and updates script paths.
*   **Source Maps:** For debugging, `javascript-obfuscator` can generate source maps. Check its documentation for the relevant options if needed, but source maps might defeat some of the purpose of obfuscation if deployed to production.
*   **Testing:** Thoroughly test your website after obfuscating scripts, as aggressive settings can sometimes break functionality.
*   **Do Not Obfuscate `service-worker.js` directly if it causes issues:** Service workers can sometimes be sensitive to obfuscation. Test this carefully. It might be better to exclude it or use very light settings.
*   **Configuration:** The provided `obfuscator.config.json` is an example with many features enabled. You might want to start with a simpler configuration and gradually enable more options, testing at each step.

Refer to the official `javascript-obfuscator` documentation for more details on configuration options and CLI usage.
