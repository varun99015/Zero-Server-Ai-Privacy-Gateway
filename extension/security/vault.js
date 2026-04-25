// security/vault.js (with full logging)
const DB_NAME = "ZeroServerVault";
const STORE_NAME = "piiMappings";
const DB_VERSION = 2;

console.log("[VAULT] Script loaded");

async function openDB() {
    console.log("[VAULT] Opening database...");
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => {
            console.error("[VAULT] Database error:", event.target.error);
            reject(request.error);
        };
        request.onsuccess = (event) => {
            console.log("[VAULT] Database opened successfully");
            resolve(request.result);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log("[VAULT] Upgrade needed, creating object store");
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "original" });
                console.log("[VAULT] Object store created");
            }
        };
    });
}

async function saveMapping(original, placeholder, type) {
    console.log(`[VAULT] saveMapping called: original="${original}", placeholder="${placeholder}", type="${type}"`);
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const record = { original, placeholder, type, timestamp: Date.now() };
        await new Promise((resolve, reject) => {
            const req = store.put(record);
            req.onsuccess = () => {
                console.log(`[VAULT] Successfully stored mapping for "${original}" -> "${placeholder}"`);
                resolve();
            };
            req.onerror = (event) => {
                console.error(`[VAULT] Failed to store mapping:`, event.target.error);
                reject(req.error);
            };
        });
        db.close();
    } catch (err) {
        console.error("[VAULT] Exception in saveMapping:", err);
    }
}

async function getPlaceholder(original) {
    console.log(`[VAULT] getPlaceholder called for "${original}"`);
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const record = await new Promise((resolve, reject) => {
            const req = store.get(original);
            req.onsuccess = () => {
                console.log(`[VAULT] getPlaceholder result:`, req.result);
                resolve(req.result);
            };
            req.onerror = (event) => {
                console.error(`[VAULT] Error getting placeholder:`, event.target.error);
                reject(req.error);
            };
        });
        db.close();
        return record ? record.placeholder : null;
    } catch (err) {
        console.error("[VAULT] Exception in getPlaceholder:", err);
        return null;
    }
}

async function getAllMappings() {
    console.log("[VAULT] getAllMappings called");
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const all = await new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => {
                console.log(`[VAULT] getAllMappings returned ${req.result.length} records`);
                resolve(req.result);
            };
            req.onerror = (event) => {
                console.error("[VAULT] Error getting all mappings:", event.target.error);
                reject(req.error);
            };
        });
        db.close();
        return all;
    } catch (err) {
        console.error("[VAULT] Exception in getAllMappings:", err);
        return [];
    }
}

// Expose globally
self.saveMapping = saveMapping;
self.getPlaceholder = getPlaceholder;
self.getAllMappings = getAllMappings;

console.log("[VAULT] Exposed functions: saveMapping, getPlaceholder, getAllMappings");