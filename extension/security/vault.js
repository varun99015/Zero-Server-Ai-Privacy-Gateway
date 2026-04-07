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
