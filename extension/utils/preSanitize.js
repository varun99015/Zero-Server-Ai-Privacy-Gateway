// utils/preSanitize.js (with logs)
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

async function preSanitize(text) {
    console.log(`[PRESANITIZE] preSanitize called with text length ${text.length}`);
    await loadCounters();

    // 1. Replace already known PII
    const knownMappings = await self.getAllMappings();
    let result = text;
    const sorted = [...knownMappings].sort((a, b) => b.original.length - a.original.length);
    console.log(`[PRESANITIZE] Replacing ${sorted.length} known mappings`);
    for (const { original, placeholder } of sorted) {
    // Escape special regex characters
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // For phone numbers and emails, we cannot rely on \b because of +, spaces, @
    // Use a simple global replace with escaped string
    const regex = new RegExp(escaped, 'g');
    if (regex.test(result)) {
        result = result.replace(regex, placeholder);
        console.log(`[PRESANITIZE] Replaced "${original}" -> "${placeholder}"`);
    }
}

    // 2. Detect new emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let match;
    while ((match = emailRegex.exec(text)) !== null) {
        const original = match[0];
        console.log(`[PRESANITIZE] Detected potential new email: "${original}"`);
        const existing = await self.getPlaceholder(original);
        if (!existing) {
            console.log(`[PRESANITIZE] No existing mapping for "${original}", creating new`);
            const placeholder = generatePlaceholder('EMAIL');
            await self.saveMapping(original, placeholder, 'email');
            const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(`\\b${escaped}\\b`, 'g'), placeholder);
            console.log(`[PRESANITIZE] Replaced new email "${original}" -> "${placeholder}"`);
        } else {
            console.log(`[PRESANITIZE] Email already mapped to ${existing}`);
        }
    }

    // 3. Detect new phones
    const phoneRegex = /\b(?:\+?1[ .-]?)?\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}\b|\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{1,4}[ .-]?\d{1,9}\b/g;
    while ((match = phoneRegex.exec(text)) !== null) {
        const original = match[0];
        console.log(`[PRESANITIZE] Detected potential new phone: "${original}"`);
        const existing = await self.getPlaceholder(original);
        if (!existing) {
            const placeholder = generatePlaceholder('PHONE');
            await self.saveMapping(original, placeholder, 'phone');
            const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(`\\b${escaped}\\b`, 'g'), placeholder);
            console.log(`[PRESANITIZE] Replaced new phone "${original}" -> "${placeholder}"`);
        }
    }

    // 4. Detect new SSNs
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    while ((match = ssnRegex.exec(text)) !== null) {
        const original = match[0];
        console.log(`[PRESANITIZE] Detected potential new SSN: "${original}"`);
        const existing = await self.getPlaceholder(original);
        if (!existing) {
            const placeholder = generatePlaceholder('SSN');
            await self.saveMapping(original, placeholder, 'ssn');
            const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(`\\b${escaped}\\b`, 'g'), placeholder);
            console.log(`[PRESANITIZE] Replaced new SSN "${original}" -> "${placeholder}"`);
        }
    }

    console.log(`[PRESANITIZE] Final result: "${result}"`);
    return result;
}

self.preSanitize = preSanitize;
console.log("[PRESANITIZE] Exposed preSanitize function");