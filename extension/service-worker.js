importScripts('assets/engine.js');
importScripts('security/vault.js');
importScripts('utils/preSanitize.js');

console.log("Zero-Server Background Service Worker Loaded");

let engineInstance = null;

createEngineModule({
    locateFile: (path) => chrome.runtime.getURL('assets/' + path)
}).then(module => {
    engineInstance = module;
    console.log("WASM Ready");
}).catch(err => {
    console.error("WASM init error:", err);
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("[SW] Received message:", message);
    if (message.type === "SCRUB") {
        const { text, id } = message;
        console.log(`[SW] Processing SCRUB for id ${id}, text: "${text}"`);

        if (!engineInstance) {
            console.warn("[SW] WASM engine not ready, sending original text");
            sendResponse({ scrubbedText: text, id });
            return;
        }

        try {
            console.log("[SW] Calling preSanitize...");
            const preSanitized = await self.preSanitize(text);
            console.log(`[SW] preSanitize result: "${preSanitized}"`);

            console.log("[SW] Calling WASM process...");
            const scrubbedText = engineInstance.ccall(
                "process",
                "string",
                ["string"],
                [preSanitized]
            );
            console.log(`[SW] WASM result: "${scrubbedText}"`);

            sendResponse({ scrubbedText, id });
        } catch (err) {
            console.error("[SW] Error:", err);
            sendResponse({ scrubbedText: text, id });
        }
        return true;
    }
});