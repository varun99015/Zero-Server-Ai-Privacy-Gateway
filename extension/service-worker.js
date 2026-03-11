console.log("Zero-Server Background Service Worker Loaded");

let engineInstance = null;
const pendingRequests = new Map();

importScripts('assets/engine.js');

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
    if (message.type === 'SCRUB') {
        const id = message.id;
        const text = message.text;

        if (!engineInstance) {
            sendResponse({ scrubbedText: text, id });
            return;
        }

        const scrubbedText = engineInstance.process(text);
        sendResponse({ scrubbedText, id });
    }
});