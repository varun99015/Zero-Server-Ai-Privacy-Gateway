// popup/popup.js
// ✅ FIX #4: Popup cannot access vault.js or IndexedDB directly (different context).
// It must send a GET_MAPPINGS message to the service worker, which fetches from
// IndexedDB and returns the data. Only then do we render to the DOM.

document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderMappings();
});

function loadAndRenderMappings() {
    const container = document.getElementById('mappings-container');
    const emptyMsg = document.getElementById('empty-msg');
    const loadingMsg = document.getElementById('loading-msg');

    if (loadingMsg) loadingMsg.style.display = 'block';
    if (emptyMsg) emptyMsg.style.display = 'none';

    // ✅ Request mappings from the service worker via chrome.runtime.sendMessage
    chrome.runtime.sendMessage({ type: 'GET_MAPPINGS' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('[POPUP] Message error:', chrome.runtime.lastError);
            if (loadingMsg) loadingMsg.style.display = 'none';
            renderError(container);
            return;
        }

        if (loadingMsg) loadingMsg.style.display = 'none';

        const mappings = response?.mappings ?? [];
        console.log(`[POPUP] Received ${mappings.length} mappings from SW`);

        if (mappings.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        renderMappings(container, mappings);
    });
}

function renderMappings(container, mappings) {
    container.innerHTML = '';

    mappings.forEach(({ original, placeholder, type, timestamp }) => {
        const row = document.createElement('div');
        row.className = 'mapping-row';
        row.innerHTML = `
            <span class="type-badge">${escapeHtml(type)}</span>
            <span class="original">${escapeHtml(original)}</span>
            <span class="arrow">→</span>
            <span class="placeholder">${escapeHtml(placeholder)}</span>
            <span class="timestamp">${new Date(timestamp).toLocaleString()}</span>
        `;
        container.appendChild(row);
    });
}

function renderError(container) {
    container.innerHTML = '<p class="error">Failed to load mappings. Try reopening the popup.</p>';
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}