// security/vault.js
const DB_NAME = "zeroServerVault";
const DB_VERSION = 1;
const STORE_NAME = "mappings";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
                store.createIndex("sessionId", "sessionId", { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Store a single mapping
async function storeMapping(sessionId, original, synthetic) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.add({
        sessionId,
        original,
        synthetic,
        timestamp: Date.now()
    });
}

// Get all mappings for a session
async function getMappings(sessionId) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("sessionId");

    return new Promise((resolve, reject) => {
        const request = index.getAll(sessionId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Clear mappings
async function clearSession(sessionId) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("sessionId");

    const request = index.getAllKeys(sessionId);

    request.onsuccess = () => {
        const keys = request.result;
        for (let key of keys) {
            store.delete(key);
        }
    };
}

// Rehydrate
async function rehydrateResponse(sessionId, responseText) {
    const mappings = await getMappings(sessionId);

    let rehydrated = responseText;

    for (let map of mappings) {
        const regex = new RegExp(map.synthetic, "g");
        rehydrated = rehydrated.replace(regex, map.original);
    }

    return rehydrated;
}

window.storeMapping = storeMapping;
window.getMappings = getMappings;
window.clearSession = clearSession;
window.rehydrateResponse = rehydrateResponse;