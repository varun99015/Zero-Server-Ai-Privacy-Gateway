// 1. Inject the patch file safely
const s = document.createElement('script');
s.src = chrome.runtime.getURL('content/inject.js');
(document.head || document.documentElement).appendChild(s);

// 2. Listen for scrub requests from the injected script (MAIN world)
window.addEventListener('SCRUB_REQ', (e) => {
    const { text, id } = e.detail;
    // Forward to background service worker
    if (!chrome.runtime?.id) {
        console.warn("Extension not ready");
        return;
    }
    chrome.runtime.sendMessage({ type: 'SCRUB', text, id }, (response) => {
        // Forward sanitized text back to injected script
        if (chrome.runtime.lastError || !response) {
            console.warn("Extension error:", chrome.runtime.lastError);

            // fallback: send original text back
            window.dispatchEvent(new CustomEvent(`SCRUB_RES_${id}`, {
                detail: { text }
            }));

            return;
        }
        window.dispatchEvent(new CustomEvent(`SCRUB_RES_${response.id}`, {
            detail: { text: response.scrubbedText }
        }));
    });
});