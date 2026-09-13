// security/vault.js (with full logging)
const DB_NAME = "ZeroServerVault";
const STORE_NAME = "piiMappings";
const DB_VERSION = 2;
const V_DEBUG = true;

if (V_DEBUG) console.log("[VAULT] Script loaded");

async function openDB() {
    if (V_DEBUG) console.log("[VAULT] Opening database...");
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = (event) => {
            if (V_DEBUG) console.error("[VAULT] Database error:", event.target.error);
            reject(request.error);
        };
        request.onsuccess = (event) => {
            if (V_DEBUG) console.log("[VAULT] Database opened successfully");
            resolve(request.result);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (V_DEBUG) console.log("[VAULT] Upgrade needed, creating object store");
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "original" });
                if (V_DEBUG) console.log("[VAULT] Object store created");
            }
        };
    });
}

async function saveMapping(original, placeholder, type) {
    if (V_DEBUG) console.log(`[VAULT] saveMapping called: original="${original}", placeholder="${placeholder}", type="${type}"`);
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const record = { original, placeholder, type, timestamp: Date.now() };
        await new Promise((resolve, reject) => {
            const req = store.put(record);
            req.onsuccess = () => {
                if (V_DEBUG) console.log(`[VAULT] Successfully stored mapping for "${original}" -> "${placeholder}"`);
                resolve();
            };
            req.onerror = (event) => {
                if (V_DEBUG) console.error(`[VAULT] Failed to store mapping:`, event.target.error);
                reject(req.error);
            };
        });
        db.close();
    } catch (err) {
        if (V_DEBUG) console.error("[VAULT] Exception in saveMapping:", err);
    }
}

async function getPlaceholder(original) {
    if (V_DEBUG) console.log(`[VAULT] getPlaceholder called for "${original}"`);
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const record = await new Promise((resolve, reject) => {
            const req = store.get(original);
            req.onsuccess = () => {
                if (V_DEBUG) console.log(`[VAULT] getPlaceholder result:`, req.result);
                resolve(req.result);
            };
            req.onerror = (event) => {
                if (V_DEBUG) console.error(`[VAULT] Error getting placeholder:`, event.target.error);
                reject(req.error);
            };
        });
        db.close();
        return record ? record.placeholder : null;
    } catch (err) {
        if (V_DEBUG) console.error("[VAULT] Exception in getPlaceholder:", err);
        return null;
    }
}

async function getAllMappings() {
    if (V_DEBUG) console.log("[VAULT] getAllMappings called");
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const all = await new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => {
                if (V_DEBUG) console.log(`[VAULT] getAllMappings returned ${req.result.length} records`);
                resolve(req.result);
            };
            req.onerror = (event) => {
                if (V_DEBUG) console.error("[VAULT] Error getting all mappings:", event.target.error);
                reject(req.error);
            };
        });
        db.close();
        return all;
    } catch (err) {
        if (V_DEBUG) console.error("[VAULT] Exception in getAllMappings:", err);
        return [];
    }
}

async function getOriginalFromPlaceholder(placeholder) {
    const db = await openDB();

    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const all = await new Promise((resolve, reject) => {
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

    db.close();

    const found = all.find(
        item => item.placeholder === placeholder
    );

    return found ? found.original : null;
}

self.getOriginalFromPlaceholder = getOriginalFromPlaceholder;

// Expose globally
self.saveMapping = saveMapping;
self.getPlaceholder = getPlaceholder;
self.getAllMappings = getAllMappings;

if (V_DEBUG) console.log("[VAULT] Exposed functions: saveMapping, getPlaceholder, getAllMappings");