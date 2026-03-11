const DB_NAME = "ZeroServerVault";

export async function saveMapping(synthetic, real) {
    const db = await openDB();
    const tx = db.transaction("mappings", "readwrite");
    tx.objectStore("mappings").put({ synthetic, real, date: new Date() });
}

function openDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore("mappings", { keyPath: "synthetic" });
        };
        request.onsuccess = () => resolve(request.result);
    });
}