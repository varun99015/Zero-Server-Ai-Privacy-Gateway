importScripts("security/vault.js");
importScripts('assets/engine.js');

console.log("Zero-Server Background Service Worker Loaded");

let engineInstance = null;
const pendingRequests = new Map();

createEngineModule({
    locateFile: (path) => chrome.runtime.getURL('assets/' + path)
}).then(module => {
    engineInstance = module;   // create C++ object instance
    console.log("Wasm engine ready");
}).catch(err => {
    console.error("Failed to initialize Wasm engine:", err);
});


function generateFakePhone() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateFakeEmail() {
    const names = ["user", "client", "demo", "guest"];
    const domains = ["gmail.com", "yahoo.com", "outlook.com"];

    const name = names[Math.floor(Math.random() * names.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];

    return `${name}${Math.floor(Math.random() * 1000)}@${domain}`;
}

function generateFakeName() {
    const names = ["Rahul", "Amit", "Neha", "Priya", "Arjun"];
    return names[Math.floor(Math.random() * names.length)];
}

function generateFakeValue(type, token) {
    if (cache[token]) return cache[token];

    let value;
    if (type === "PHONE") value = generateFakePhone();
    if (type === "EMAIL") value = generateFakeEmail();
    if (type === "NAME") value = generateFakeName();

    cache[token] = value;
    return value;
}

function replaceWithFake(original, sanitized) {
    const tokenRegex = /(PHONE_\d+|EMAIL_\d+|NAME_\d+)/g;

    let result = sanitized;
    let match;

    const originalMatches = original.match(/\b[\w@.+-]+\b/g) || [];

    while ((match = tokenRegex.exec(sanitized)) !== null) {
        const token = match[0];
        const type = token.split("_")[0];

        const fakeValue = generateFakeValue(type, token);

        // pick first unmatched original (simple mapping)
        const real = originalMatches.shift() || "unknown";

        storeMapping(real, fakeValue, type);

        result = result.replace(token, fakeValue);
    }

    return result;
}


function storeMapping(original, fake, type) {
    chrome.storage.local.get(["logs"], (res) => {
        let logs = res.logs || [];

        logs.push({
            original,
            fake,
            type,
            time: new Date().toISOString()
        });

        chrome.storage.local.set({ logs });
    });
}

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
            let scrubbedText = engineInstance.ccall(
                "process",
                "string",
                ["string"],
                [text]
            );

            scrubbedText = replaceWithFake(text, scrubbedText);

            sendResponse({ scrubbedText, id });
            console.log("Original:", text);
            console.log("Sanitized:", scrubbedText);
        } catch (err) {
            console.error("Wasm processing error:", err);
            sendResponse({ scrubbedText: text, id }); // fallback
        }
    }
});