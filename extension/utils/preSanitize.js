// utils/preSanitize.js
// Combined dummyGenerator + preSanitize – no ES imports needed

// ---------- Dummy Generator (inlined) ----------
function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        hash |= 0;
    }
    return hash >>> 0;
}
function toHex8(num) {
    return num.toString(16).padStart(8, '0').substring(0, 8);
}
function generateDummy(original, type) {
    const hash = hashString(original);
    const hex = toHex8(hash);
    switch (type) {
        case 'email': return `user_${hex}@example.com`;
        case 'phone': return `+1-555-01${String(parseInt(hex.slice(-2), 16) % 100).padStart(2, '0')}`;
        case 'ssn': return `123-45-${String(parseInt(hex.slice(0, 4), 16) % 10000).padStart(4, '0')}`;
        case 'credit_card': return `4111-1111-1111-${String(parseInt(hex.slice(-4), 16) % 10000).padStart(4, '0')}`;
        case 'ip': return `192.0.2.${(hash % 254) + 1}`;
        case 'mac': return `00:1A:2B:${hex.match(/.{1,2}/g).slice(0, 3).join(':')}`;
        case 'dob': return `1980-01-${String((hash % 28) + 1).padStart(2, '0')}`;
        case 'age': return `${(hash % 36) + 25} years old`;
        case 'address': return `123 Main St, Apt ${hex.slice(0, 2)}`;
        case 'location': return `${String.fromCharCode(65 + (hash % 26))}-City, ${String.fromCharCode(65 + (hash % 26))}A 12345`;
        case 'drivers_license': return `DL${hex.slice(0, 6).toUpperCase()}`;
        case 'passport': return `${(hash % 900000000) + 100000000}`;
        case 'bank': return `BANK${hex.slice(0, 8).toUpperCase()}`;
        case 'medical': return `MED-${hex.slice(0, 6).toUpperCase()}`;
        case 'vin': return `1G${(hex + hex).toUpperCase().substring(0, 16)}`;
        case 'coordinate': return `${((hash % 180) - 90 + (hash % 1000) / 1000).toFixed(4)} N, ${((hash % 360) - 180 + (hash % 1000) / 1000).toFixed(4)} W`;
        case 'username': return `@user_${hex.slice(0, 6)}`;
        case 'password': return `password: fakePass_${hex.slice(0, 6)}`;
        default: return `REDACTED_${hex}`;
    }
}

// ---------- PreSanitize ----------
console.log("[PRESANITIZE] Script loaded");

function replaceAll(text, search, replace) {
    return text.split(search).join(replace);
}

async function preSanitize(text) {
    console.log(`[PRESANITIZE] preSanitize called with text length ${text.length}`);

    let result = text;

    // Replace already known PII from vault
    const knownMappings = await self.getAllMappings();
    console.log(`[PRESANITIZE] Replacing ${knownMappings.length} known mappings`);
    for (const { original, placeholder } of knownMappings) {
        if (result.includes(original)) {
            result = replaceAll(result, original, placeholder);
            console.log(`[PRESANITIZE] Replaced known "${original}" -> "${placeholder}"`);
        }
    }

    const detectors = [
        { name: "EMAIL", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, type: "email" },
        { name: "PHONE", regex: /\b(?:\+?1[ .-]?)?\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}\b|\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{1,4}[ .-]?\d{1,9}\b/g, type: "phone" },
        { name: "SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/g, type: "ssn" },
        { name: "CREDIT_CARD", regex: /\b(?:\d[ -]*?){13,19}\b/g, type: "credit_card" },
        { name: "IP", regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b/g, type: "ip" },
        { name: "MAC", regex: /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/g, type: "mac" },
        { name: "DOB", regex: /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g, type: "dob" },
        { name: "AGE", regex: /\b\d{1,3}\s*(years? old|yo|y\/o)\b/g, type: "age" },
        { name: "ADDRESS", regex: /\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/g, type: "address" },
        { name: "LOCATION", regex: /\b[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b/g, type: "location" },
        { name: "DL", regex: /\b[A-Z]{1,2}\d{4,9}\b/g, type: "drivers_license" },
        { name: "PASSPORT", regex: /\b\d{9}\b/g, type: "passport" },
        { name: "BANK", regex: /\b(?:account|acct|routing)[:\s]*(\d{9,14})\b/gi, type: "bank", extractGroup: 1 },
        { name: "MEDICAL", regex: /\b(?:member id|policy #|insurance id|medicaid|medicare)[:\s]*([A-Z0-9]{6,12})\b/gi, type: "medical", extractGroup: 1 },
        { name: "VIN", regex: /\b[A-HJ-NPR-Z0-9]{17}\b/g, type: "vin" },
        { name: "COORD", regex: /\b-?\d{1,3}\.\d+[°\s]?[NS],?\s*-?\d{1,3}\.\d+[°\s]?[EW]\b/g, type: "coordinate" },
        { name: "USERNAME", regex: /(?:^|\s)@[A-Za-z0-9_]+\b/g, type: "username" },
        { name: "PASSWORD", regex: /\b(?:password|passwd|pwd)[:\s]*[^\s]{4,}\b/gi, type: "password", extractGroup: null },
        { name: "API_KEY", regex: /\b(?:AIza[0-9A-Za-z\-_]{35}|AKIA[0-9A-Z]{16}|ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z]{82})\b/g, type: "api_key" },
        { name: "JWT", regex: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, type: "jwt" }
    ];

    for (const detector of detectors) {
        detector.regex.lastIndex = 0;
        let match;
        while ((match = detector.regex.exec(text)) !== null) {
            let original = match[0];
            if (detector.extractGroup) {
                original = match[detector.extractGroup] || original;
            }
            console.log(`[PRESANITIZE] Detected ${detector.name}: "${original}"`);

            const existing = await self.getPlaceholder(original);
            if (!existing) {
                const dummy = generateDummy(original, detector.type);
                const placeholder = dummy;
                await self.saveMapping(original, placeholder, detector.type);
                result = replaceAll(result, original, placeholder);
                console.log(`[PRESANITIZE] Mapped "${original}" -> "${dummy}"`);
            } else {
                result = replaceAll(result, original, existing);
            }
        }
    }

    console.log(`[PRESANITIZE] Final result: "${result}"`);
    return result;
}

self.preSanitize = preSanitize;
console.log("[PRESANITIZE] Exposed preSanitize function");