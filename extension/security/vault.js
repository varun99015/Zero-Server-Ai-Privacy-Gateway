const DB_NAME = "ZeroServerVault";

let counters = {
    EMAIL: 0,
    PHONE: 0,
    NAME: 0
};

function generateToken(type) {
    counters[type]++;
    return `${type}_${counters[type]}`;
}

async function saveMapping(synthetic, real) {
    const db = await openDB();
    const tx = db.transaction("mappings", "readwrite");
    tx.objectStore("mappings").put({ synthetic, real, date: new Date() });
}

const cache = {};

function generateFakeValue(type, token) {
    if (cache[token]) return cache[token];

    let value;
    if (type === "PHONE") value = generateFakePhone();
    if (type === "EMAIL") value = generateFakeEmail();
    if (type === "NAME") value = generateFakeName();

    cache[token] = value;
    return value;
}

function openDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = () => {
            request.result.createObjectStore("mappings", {
                keyPath: "synthetic"
            });
        };

        request.onsuccess = () => resolve(request.result);
    });
}

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