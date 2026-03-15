importScripts("security/vault.js");
importScripts('assets/engine.js');

console.log("Zero-Server Background Service Worker Loaded");

let engineInstance = null;
const pendingRequests = new Map();

createEngineModule({
    locateFile: (path, prefix) => {
        return chrome.runtime.getURL('assets/' + path);
    }
}).then(module => {
    engineInstance = new module.Sanitizer();
    console.log("Wasm engine ready");
}).catch(err => {
    console.error("Failed to initialize Wasm engine:", err);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.type === "SCRUB") {

        const text = message.text;
        const id = message.id;

        if (!engineInstance) {
            sendResponse({ scrubbedText: text, id });
            return;
        }

        const scrubbedText = engineInstance.process(text);

        console.log("Original:", text);
        console.log("Sanitized:", scrubbedText);

        // detect mappings
        detectAndStore(text, scrubbedText);

        sendResponse({ scrubbedText, id });
    }

});

async function detectAndStore(original, sanitized) {

    const originalWords = original.split(" ");
    const sanitizedWords = sanitized.split(" ");

    for (let i = 0; i < originalWords.length; i++) {

        const o = originalWords[i];
        const s = sanitizedWords[i];

        // if the word changed and sanitizer produced a hidden token
        if (o !== s && s.includes("HIDDEN")) {

            console.log("Detected replacement:", o, "→", s);

            await saveMapping(s, o);

            console.log("Vault mapping saved:", s, "->", o);
        }
    }
}