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
    // 1. Check in-memory cache
    if (cache[token]) return cache[token];

    // 2. Check persistent storage (loaded into tokenMap)
    if (tokenMap[token]) {
        cache[token] = tokenMap[token];
        return tokenMap[token];
    }

    // 3. Generate new fake value
    let value;
    if (type === "PHONE") value = generateFakePhone();
    if (type === "EMAIL") value = generateFakeEmail();
    if (type === "NAME") value = generateFakeName();

    // 4. Save in cache
    cache[token] = value;

    // 5. Save in persistent storage
    tokenMap[token] = value;
    chrome.storage.local.set({ tokenMap });

    return value;
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

