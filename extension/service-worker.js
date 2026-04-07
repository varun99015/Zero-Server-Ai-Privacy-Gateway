importScripts("security/vault.js");
importScripts('assets/engine.js');

console.log("Zero-Server Background Service Worker Loaded");

let engineInstance = null;
const pendingRequests = new Map();

createEngineModule({
    locateFile: (path) => chrome.runtime.getURL('assets/' + path)
}).then(module => {
    engineInstance = new module.Sanitizer();   // create C++ object instance
    console.log("Wasm engine ready");
}).catch(err => {
    console.error("Failed to initialize Wasm engine:", err);
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SCRUB") {
        const { text, id } = message;

        if (!engineInstance) {
            // Engine not ready – fallback to original text
            sendResponse({ scrubbedText: text, id });
            return;
        }

        try {
            // Call C++ process() method
            const scrubbedText = engineInstance.process(text);
            console.log("Original:", text);
            console.log("Sanitized:", scrubbedText);
            sendResponse({ scrubbedText, id });
        } catch (err) {
            console.error("Wasm processing error:", err);
            sendResponse({ scrubbedText: text, id }); // fallback
        }
    }
});