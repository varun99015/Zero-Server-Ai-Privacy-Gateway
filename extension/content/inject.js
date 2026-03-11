(function() {
    const { fetch: originalFetch } = window;

    window.fetch = async (...args) => {
        let [resource, config] = args;

        // Only intercept if there's a body and it's a chat endpoint
        if (config?.body && typeof config.body === 'string' && resource.includes("conversation")) {
            try {
                // SAFE CHECK: Ensure it's actually JSON before parsing
                if (config.body.trim().startsWith('{')) {
                    const data = JSON.parse(config.body);
                    const userMessage = data.messages?.[0]?.content?.parts?.[0];

                    if (userMessage) {
                        const id = Math.random().toString(36).substring(7);
                        
                        // Ask the Isolated Content Script to process this
                        const scrubbed = await new Promise((resolve) => {
                            window.addEventListener(`SCRUB_RES_${id}`, (e) => resolve(e.detail.text), { once: true });
                            window.dispatchEvent(new CustomEvent('SCRUB_REQ', { detail: { text: userMessage, id } }));
                        });

                        data.messages[0].content.parts[0] = scrubbed;
                        config.body = JSON.stringify(data);
                    }
                }
            } catch (e) {
                console.warn("[Zero-Server] Skipping non-JSON or malformed fetch.");
            }
        }
        return originalFetch.apply(this, args);
    };
})();