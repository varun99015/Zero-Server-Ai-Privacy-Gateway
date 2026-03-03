console.log("🚀 CONTENT SCRIPT IS RUNNING");

async function runSecurityTests() {
    console.log("=== RUNNING SECURITY TESTS ===");

    const sessionId = "test-session-1";

    // Store mappings
    await storeMapping(sessionId, "Suraj", "Arjun");
    await storeMapping(sessionId, "Ramesh", "Vikram");

    console.log("Mappings Stored");

    // Retrieve mappings
    const mappings = await getMappings(sessionId);
    console.log("Retrieved Mappings:", mappings);

    // Test rehydration
    const fakeResponse = "Hello Arjun and Vikram";
    const restored = await rehydrateResponse(sessionId, fakeResponse);
    console.log("Rehydrated Response:", restored);

    // Test hash
    const hash = await generateHash("Hello World");
    console.log("SHA-256 Hash:", hash);

    // Test attestation
    const attestation = await createAttestation(sessionId, "Sanitized Prompt");
    console.log("Attestation Object:", attestation);

    console.log("=== TEST COMPLETE ===");

    console.log("Testing hash directly inside content script...");

    generateHash("Hello World").then(hash => {
        console.log("Hash inside content script:", hash);
    });
}

runSecurityTests();