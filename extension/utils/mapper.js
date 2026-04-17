
function replaceWithFake(original, sanitized) {
    const tokenRegex = /(PHONE_\d+|EMAIL_\d+|NAME_\d+|SSN_\d+|IP_\d+|DOB_\d+|STREET_\d+|CARD_\d+|PASSPORT_\d+)/g;

    let result = sanitized;
    let match;

    const originalMatches = original.match(/\b[\w@.+-]+\b/g) || [];

    while ((match = tokenRegex.exec(sanitized)) !== null) {
        const token = match[0];
        const type = token.split("_")[0];

        const fakeValue = generateFakeValue(type, token);

        // pick first unmatched original (simple mapping)
        const real = originalMatches.shift() || "unknown";

        storeMapping(real, fakeValue, type);

        result = result.replace(token, fakeValue);
    }

    return result;
}

function storeMapping(original, fake, type) {
    chrome.storage.local.get(["logs"], (res) => {
        let logs = res.logs || [];

        logs.push({
            original,
            fake,
            type,
            time: new Date().toISOString()
        });

        chrome.storage.local.set({ logs });
    });
}