// audit.js – reads from IndexedDB and displays mappings
const DB_NAME = "ZeroServerVault";
const STORE_NAME = "piiMappings";
const DB_VERSION = 2;

async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "original" });
            }
        };
    });
}

async function getAllMappings() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const all = await new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    db.close();
    return all || [];
}

async function clearAllMappings() {
    if (!confirm("⚠️ Are you sure you want to DELETE ALL stored mappings? This action cannot be undone.")) {
        return;
    }
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
    db.close();
    await refreshTable();
}

async function refreshTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Loading...</td></tr>';
    
    const mappings = await getAllMappings();
    if (!mappings.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty">✨ No stored mappings yet. Send a prompt containing PII (email, phone, SSN) to create entries.</td></tr>';
        return;
    }
    
    // Sort by timestamp descending (newest first)
    mappings.sort((a, b) => b.timestamp - a.timestamp);
    
    tbody.innerHTML = "";
    for (const m of mappings) {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = m.original;
        row.insertCell(1).textContent = m.placeholder;
        row.insertCell(2).textContent = m.type || "unknown";
        const date = m.timestamp ? new Date(m.timestamp).toLocaleString() : "N/A";
        row.insertCell(3).textContent = date;
    }
}

// Initial load
refreshTable();

// Event listeners
document.getElementById("refreshBtn").addEventListener("click", refreshTable);
document.getElementById("clearBtn").addEventListener("click", clearAllMappings);