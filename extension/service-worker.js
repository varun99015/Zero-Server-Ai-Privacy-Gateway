importScripts('assets/engine.js');
importScripts('security/vault.js');
importScripts('utils/preSanitize.js');

console.log("Zero-Server Background Service Worker Loaded");

let engineInstance = null;

// The engine is still initialised (in case you need it later), but we won't use it.
createEngineModule({
    locateFile: (path) => chrome.runtime.getURL('assets/' + path)
}).then(module => {
    engineInstance = module;
    console.log("WASM Ready (unused in this version)");
}).catch(err => {
    console.error("WASM init error:", err);
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("[SW] Received message:", message);
    if (message.type === "SCRUB") {
        const { text, id } = message;
        console.log(`[SW] Processing SCRUB for id ${id}, text: "${text}"`);

        // Remove the engine‑not‑ready fallback – preSanitize works without it
        try {
            console.log("[SW] Calling preSanitize...");
            const preSanitized = await self.preSanitize(text);
            console.log(`[SW] preSanitize result: "${preSanitized}"`);

            // ⛔ Skip the WASM call – it would replace our dummies with [xxx_HIDDEN]
            // const scrubbedText = engineInstance.ccall(...);

            // Send the pre‑sanitized text directly
            sendResponse({ scrubbedText: preSanitized, id });
        } catch (err) {
            console.error("[SW] Error:", err);
            sendResponse({ scrubbedText: text, id });
        }
        return true; // keep the message channel open for async response
    }
});