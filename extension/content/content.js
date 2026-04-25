// 1. Inject the patch file safely
const s = document.createElement('script');
s.src = chrome.runtime.getURL('content/inject.js');
(document.head || document.documentElement).appendChild(s);

// 2. Send message to background with retry and auto‑reload
function sendToExtension(message, callback, retries = 10) {
    if (!chrome.runtime?.id) {
        if (retries > 0) {
            console.warn(`Extension not ready, retrying... (${retries} attempts left)`);
            setTimeout(() => {
                sendToExtension(message, callback, retries - 1);
            }, 500); // longer delay (500ms)
        } else {
            console.error("Extension context invalidated – reloading page...");
            window.location.reload(); // force page reload to re‑inject content script
        }
        return;
    }

    chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError || !response) {
            console.warn("Extension sendMessage error:", chrome.runtime.lastError);
            if (retries > 0) {
                setTimeout(() => {
                    sendToExtension(message, callback, retries - 1);
                }, 500);
            } else {
                console.error("Extension unreachable – reloading page...");
                window.location.reload();
            }
            return;
        }
        callback(response);
    });
}

// 3. Listen for scrub requests from injected script
window.addEventListener('SCRUB_REQ', (e) => {
    const { text, id } = e.detail;
    sendToExtension({ type: 'SCRUB', text, id }, (response) => {
        window.dispatchEvent(new CustomEvent(`SCRUB_RES_${response.id}`, {
            detail: { text: response.scrubbedText }
        }));
    });
});

// 4. Optional: detect extension disconnection and reload
if (chrome.runtime?.id) {
    chrome.runtime.onConnect.addListener(() => {});
    // If the extension disconnects, the page will be reloaded by the retry mechanism.
}