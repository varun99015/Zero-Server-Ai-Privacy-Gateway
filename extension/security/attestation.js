// security/attestation.js
async function generateHash(data) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);

    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}

async function createAttestation(sessionId, sanitizedPrompt) {
    const payload = sanitizedPrompt + "|" + sessionId + "|" + Date.now();
    const hash = await generateHash(payload);

    return {
        sessionId,
        hash,
        timestamp: Date.now()
    };
}

window.generateHash = generateHash;
window.createAttestation = createAttestation;