export async function signPrompt(payload) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);

    // Generate hardware-backed signature
    const keyPair = await window.crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign", "verify"]
    );

    const signature = await window.crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        keyPair.privateKey,
        data
    );

    return signature;
}