importScripts('../assets/engine.js');

let engineInstance = null;

// Initialize Wasm Module
Module().then(instance => {
    engineInstance = instance.ccall("process", "string", ["string"], [""]);
    console.log("Zero-Server Engine: Wasm Worker Initialized.");

    queue.forEach(data => self.onmessage({ data }));
    queue = [];
});

const cache = {};

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

let queue = [];

self.onmessage = function (e) {
    if (!engineInstance) {
        queue.push(e.data);
        return;
    }

    const { text, id } = e.data;

    let scrubbedText = engineInstance.process(text);
    scrubbedText = replaceWithFake(text, scrubbedText);

    self.postMessage({ scrubbedText, id });
};

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