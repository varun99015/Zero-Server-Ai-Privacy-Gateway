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
    switch (type) {
        case "PHONE":    value = generateFakePhone(); break;
        case "EMAIL":    value = generateFakeEmail(); break;
        case "NAME":     value = generateFakeName(); break;
        case "SSN":      value = generateFakeSSN(); break;
        case "IP":       value = generateFakeIP(); break;
        case "DOB":      value = generateFakeDate(); break;
        case "STREET":   value = generateFakeAddress(); break;
        case "CARD":     value = "411111111111" + Math.floor(1000+Math.random()*8999); break;
        case "PASSPORT": value = generateFakePassport(); break;
        default:         value = "[REDACTED]";
    }

    // 4. Save in cache
    cache[token] = value;

    // 5. Save in persistent storage
    tokenMap[token] = value;
    chrome.storage.local.set({ tokenMap });

    return value;
}

function generateFakeSSN() {
    return `${Math.floor(100+Math.random()*800)}-${Math.floor(10+Math.random()*89)}-${Math.floor(1000+Math.random()*8999)}`;
}

function generateFakeIP() {
    return `${Math.floor(Math.random()*223)}.${Math.floor(Math.random()*255)}.1.${Math.floor(Math.random()*255)}`;
}

function generateFakeDate() {
    const year = Math.floor(1970 + Math.random() * 40);
    const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const day = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateFakeAddress() {
    const nos = ["102", "45", "789", "12"];
    const streets = ["Maple St", "Oak Ave", "Sunset Blvd", "Broadway"];
    return `${nos[Math.floor(Math.random()*nos.length)]} ${streets[Math.floor(Math.random()*streets.length)]}`;
}

function generateFakePassport() {
    return Math.random().toString(10).slice(2, 11); // 9 digits
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

