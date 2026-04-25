// utils/preSanitize.js – Full PII detection and vault storage
console.log("[PRESANITIZE] Script loaded");

let counters = {
    EMAIL: 0, PHONE: 0, SSN: 0, CREDIT_CARD: 0, IP: 0, MAC: 0, DOB: 0,
    AGE: 0, ADDRESS: 0, LOCATION: 0, DL: 0, PASSPORT: 0, BANK: 0,
    MEDICAL: 0, VIN: 0, COORD: 0, USERNAME: 0, PASSWORD: 0
};

async function loadCounters() {
    console.log("[PRESANITIZE] Loading counters from existing mappings");
    const mappings = await self.getAllMappings();
    console.log(`[PRESANITIZE] Found ${mappings.length} existing mappings`);
    for (const m of mappings) {
        const parts = m.placeholder.split('_');
        if (parts.length === 2) {
            const type = parts[0];
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && counters[type] !== undefined) {
                counters[type] = Math.max(counters[type], num);
            }
        }
    }
    console.log("[PRESANITIZE] Counters after loading:", counters);
}

function generatePlaceholder(type) {
    counters[type] = (counters[type] || 0) + 1;
    const placeholder = `${type}_${counters[type]}`;
    console.log(`[PRESANITIZE] Generated new placeholder: ${placeholder} for type ${type}`);
    return placeholder;
}

// Helper to replace all occurrences of a string in text (without regex boundaries)
function replaceAll(text, search, replace) {
    return text.split(search).join(replace);
}

async function preSanitize(text) {
    console.log(`[PRESANITIZE] preSanitize called with text length ${text.length}`);
    await loadCounters();

    let result = text;

    // First, replace already known PII from vault (exact string match, no regex)
    const knownMappings = await self.getAllMappings();
    console.log(`[PRESANITIZE] Replacing ${knownMappings.length} known mappings`);
    for (const { original, placeholder } of knownMappings) {
        if (result.includes(original)) {
            result = replaceAll(result, original, placeholder);
            console.log(`[PRESANITIZE] Replaced known "${original}" -> "${placeholder}"`);
        }
    }

    // Define detection functions for each PII type
    // Each function returns an array of { original, type }
    const detectors = [
        {
            name: "EMAIL",
            regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            type: "email"
        },
        {
            name: "PHONE",
            regex: /\b(?:\+?1[ .-]?)?\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}\b|\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{1,4}[ .-]?\d{1,9}\b/g,
            type: "phone"
        },
        {
            name: "SSN",
            regex: /\b\d{3}-\d{2}-\d{4}\b/g,
            type: "ssn"
        },
        {
            name: "CREDIT_CARD",
            regex: /\b(?:\d[ -]*?){13,19}\b/g,
            type: "credit_card",
            // Luhn check optional – we can add later, but for now store all candidates
        },
        {
            name: "IP",
            regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b/g,
            type: "ip"
        },
        {
            name: "MAC",
            regex: /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/g,
            type: "mac"
        },
        {
            name: "DOB",
            regex: /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g,
            type: "dob"
        },
        {
            name: "AGE",
            regex: /\b\d{1,3}\s*(years? old|yo|y\/o)\b/g,
            type: "age"
        },
        {
            name: "ADDRESS",
            regex: /\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/g,
            type: "address"
        },
        {
            name: "LOCATION",
            regex: /\b[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b/g,
            type: "location"
        },
        {
            name: "DL",
            regex: /\b[A-Z]{1,2}\d{4,9}\b/g,
            type: "drivers_license"
        },
        {
            name: "PASSPORT",
            regex: /\b\d{9}\b/g,
            type: "passport"
        },
        {
            name: "BANK",
            regex: /\b(?:account|acct|routing)[:\s]*(\d{9,14})\b/gi,
            type: "bank",
            extractGroup: 1
        },
        {
            name: "MEDICAL",
            regex: /\b(?:member id|policy #|insurance id|medicaid|medicare)[:\s]*([A-Z0-9]{6,12})\b/gi,
            type: "medical",
            extractGroup: 1
        },
        {
            name: "VIN",
            regex: /\b[A-HJ-NPR-Z0-9]{17}\b/g,
            type: "vin"
        },
        {
            name: "COORD",
            regex: /\b-?\d{1,3}\.\d+[°\s]?[NS],?\s*-?\d{1,3}\.\d+[°\s]?[EW]\b/g,
            type: "coordinate"
        },
        {
            name: "USERNAME",
            regex: /@[A-Za-z0-9_]+/g,
            type: "username"
        },
        {
            name: "PASSWORD",
            regex: /\b(?:password|passwd|pwd)[:\s]*[^\s]{4,}\b/gi,
            type: "password",
            extractGroup: null // replace whole match
        }
    ];

    // Process each detector
    for (const detector of detectors) {
        let match;
        // Reset regex lastIndex
        detector.regex.lastIndex = 0;
        while ((match = detector.regex.exec(text)) !== null) {
            let original = match[0];
            if (detector.extractGroup) {
                original = match[detector.extractGroup] || original;
            }
            console.log(`[PRESANITIZE] Detected ${detector.name}: "${original}"`);
            
            // Check if already mapped
            const existing = await self.getPlaceholder(original);
            if (!existing) {
                const placeholder = generatePlaceholder(detector.name);
                await self.saveMapping(original, placeholder, detector.type);
                // Replace in result
                // Use simple replaceAll because the string may appear multiple times
                result = replaceAll(result, original, placeholder);
                console.log(`[PRESANITIZE] Replaced new ${detector.name} "${original}" -> "${placeholder}"`);
            } else {
                console.log(`[PRESANITIZE] ${detector.name} already mapped to ${existing}`);
                // Ensure it's replaced in result (in case it wasn't already replaced by known mappings loop)
                if (!result.includes(original)) {
                    // Already replaced? Do nothing
                } else {
                    result = replaceAll(result, original, existing);
                }
            }
        }
    }

    console.log(`[PRESANITIZE] Final result: "${result}"`);
    return result;
}

self.preSanitize = preSanitize;
console.log("[PRESANITIZE] Exposed preSanitize function");