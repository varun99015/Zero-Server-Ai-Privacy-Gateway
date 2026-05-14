// 1. Inject the patch file safely
const s = document.createElement('script');
s.src = chrome.runtime.getURL('content/inject.js');
(document.head || document.documentElement).appendChild(s);
let remapTimeout = null;

// 2. Send message to background with retry and auto‑reload
function sendToExtension(message, callback, retries = 10) {
    if (!chrome.runtime?.id) {
        if (retries > 0) {
            console.warn(`Extension not ready, retrying... (${retries} attempts left)`);
            setTimeout(() => {
                sendToExtension(message, callback, retries - 1);
            }, 500);
        } else {
            console.error("Extension context invalidated – reloading page...");
            window.location.reload();
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
        triggerRemap();
    });
});

async function remapVisibleText() {
    // <-- FIX: exit immediately if extension is disabled
    if (!chrome.runtime?.id) return;

    chrome.runtime.sendMessage(
        { type: "GET_MAPPINGS" },
        (response) => {
            const mappings = response?.mappings || [];

            const root = document.querySelector("main");
            if (!root) return;

            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT
            );

            let node;

            while ((node = walker.nextNode())) {
                if (
                    node.parentElement &&
                    (
                        node.parentElement.isContentEditable ||
                        node.parentElement.closest("textarea") ||
                        node.parentElement.closest("input")
                    )
                ) {
                    continue;
                }

                let text = node.nodeValue;

                for (const { original, placeholder } of mappings) {
                    if (typeof text === "string" &&
                        text.includes(placeholder)) {

                        text = text
                            .split(placeholder)
                            .join(original);
                    }
                }

                if (text !== node.nodeValue) {
                    node.nodeValue = text;
                }
            }
        }
    );
}

function triggerRemap() {

    clearTimeout(remapTimeout);

    remapTimeout = setTimeout(() => {
        remapVisibleText();
    }, 1500);
}

// window.addEventListener('REMAP_REQ', ...) - unchanged, leave commented

// 4. Optional: detect extension disconnection and reload
if (chrome.runtime?.id) {
    chrome.runtime.onConnect.addListener(() => { });
}