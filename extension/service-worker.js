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
    engineInstance = module;
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

        let scrubbedText = engineInstance.ccall(
            "process",      // function name in C++
            "string",       // return type
            ["string"],     // argument types
            [text]          // arguments
        );
        scrubbedText = replaceWithFake(text, scrubbedText);

        console.log("Original:", text);
        console.log("Sanitized:", scrubbedText);

        // detect mappings
        // detectAndStore(text, scrubbedText);

        sendResponse({ scrubbedText, id });
    }

});

function replaceWithFake(original, sanitized) {
    const tokenRegex = /(PHONE_\d+|EMAIL_\d+|NAME_\d+)/g;

    let result = sanitized;
    let match;

    while ((match = tokenRegex.exec(sanitized)) !== null) {
        const token = match[0];

        let type = token.split("_")[0];
        const fakeValue = generateFakeValue(type, token);

        result = result.replace(token, fakeValue);

        console.log(`Replaced ${token} → ${fakeValue}`);
    }

    return result;
}