importScripts('assets/engine.js');
importScripts("utils/fakeGenerator.js");
importScripts("utils/mapper.js");

let tokenMap = {};

chrome.storage.local.get(["tokenMap"], (res) => {
    tokenMap = res.tokenMap || {};
});

console.log("Zero-Server Background Service Worker Loaded");

let engineInstance = null;

// Initialize WASM
createEngineModule({
    locateFile: (path) => chrome.runtime.getURL('assets/' + path)
}).then(module => {
    engineInstance = module;
    console.log("WASM Ready");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SCRUB") {
        const { text, id } = message;

        if (!engineInstance) {
            sendResponse({ scrubbedText: text, id });
            return;
        }

        try {
            let scrubbedText = engineInstance.ccall(
                "process",
                "string",
                ["string"],
                [text]
            );

            scrubbedText = replaceWithFake(text, scrubbedText);

            console.log("Original:", text);
            console.log("Sanitized:", scrubbedText);

            sendResponse({ scrubbedText, id });
        } catch (err) {
            console.error("Wasm processing error:", err);
            sendResponse({ scrubbedText: text, id });
        }

        return true;
    }
});