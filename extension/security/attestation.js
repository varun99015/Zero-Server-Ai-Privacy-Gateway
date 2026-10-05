// security/attestation.js
// PROTOTYPE — not yet wired into the sanitization pipeline. See Future Work.
// Generates a persistent signing key on first use and signs a payload with it.

let cachedKeyPair = null;

async function getOrCreateKeyPair() {
    if (cachedKeyPair) return cachedKeyPair;
    cachedKeyPair = await self.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign", "verify"]
    );
    return cachedKeyPair;
}

async function signPrompt(payload) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const keyPair = await getOrCreateKeyPair();
    const signature = await self.crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        keyPair.privateKey,
        data
    );
    return signature;
}

self.signPrompt = signPrompt;