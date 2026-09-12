const CONFIG = {
    seed: 20260912,
    perType: 60,
    mixedCount: 120
};


// ============================================================
// DETERMINISTIC RANDOM NUMBER GENERATOR
// ============================================================

function mulberry32(seed) {
    let t = seed >>> 0;

    return function rand() {
        t += 0x6D2B79F5;

        let r = Math.imul(
            t ^ (t >>> 15),
            1 | t
        );

        r ^= r + Math.imul(
            r ^ (r >>> 7),
            61 | r
        );

        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

const random = mulberry32(CONFIG.seed);


function int(min, max) {
    return Math.floor(
        random() * (max - min + 1)
    ) + min;
}


function pick(arr) {
    return arr[
        Math.floor(random() * arr.length)
    ];
}


function pad(n, width) {
    return String(n).padStart(width, '0');
}


function slug(s) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}


// ============================================================
// BASIC DATA GENERATORS
// ============================================================

function randomName() {

    const first = pick([
        'Rahul',
        'Priya',
        'Arjun',
        'Neha',
        'Vikram',
        'Aisha',
        'Daniel',
        'Maya',
        'John',
        'Emily',
        'Karan',
        'Ananya'
    ]);

    const last = pick([
        'Sharma',
        'Patel',
        'Rao',
        'Nair',
        'Singh',
        'Mehta',
        'Iyer',
        'Brown',
        'Miller',
        'Wilson',
        'Thomas',
        'Das'
    ]);

    return {
        first,
        last,
        full: `${first} ${last} `
    };
}


function randomEmail() {

    const n = randomName();

    const user = pick([
        `${n.first.toLowerCase()}.${n.last.toLowerCase()} `,
        `${n.first.toLowerCase()}_${int(10, 999)} `,
        `${n.first.toLowerCase()}.${slug(n.last)}${int(1, 99)} `,
        `${n.first.toLowerCase()} +work`,
        `${n.last.toLowerCase()}.${n.first.toLowerCase()} `
    ]);

    const domain = pick([
        'gmail.com',
        'example.com',
        'outlook.com',
        'company.co.uk',
        'mail.org',
        'university.edu'
    ]);

    return `${user} @${domain} `;
}


function phoneUS() {

    return `(${int(201, 989)}) ${int(200, 999)} -${int(1000, 9999)} `;
}


function phoneIndia() {

    return `+ 91 ${int(60000, 99999)} ${int(10000, 99999)} `;
}


function phoneInternational() {

    return pick([

        `+ 1 ${int(201, 989)} ${int(200, 999)} ${int(1000, 9999)} `,

        `+ 44 ${int(7000, 7999)} ${int(100000, 999999)} `,

        `+ 61 ${int(400, 499)} ${int(100, 999)} ${int(100, 999)} `
    ]);
}


function validSSN() {

    return `${int(100, 899)} -${int(10, 99)} -${int(1000, 9999)} `;
}


// ============================================================
// LUHN CREDIT CARD GENERATION
// ============================================================

function computeLuhnCheckDigit(partialNumber) {

    let sum = 0;
    let shouldDouble = true;

    for (
        let i = partialNumber.length - 1;
        i >= 0;
        i--
    ) {

        let digit = Number(partialNumber[i]);

        if (shouldDouble) {

            digit *= 2;

            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;

        shouldDouble = !shouldDouble;
    }

    return (10 - (sum % 10)) % 10;
}


function validCard() {

    const prefix = pick([
        '4',
        '5',
        '6'
    ]);

    let partial = prefix;

    while (partial.length < 15) {
        partial += String(int(0, 9));
    }

    const digits =
        partial +
        computeLuhnCheckDigit(partial);

    const format = pick([
        'plain',
        'spaces',
        'dashes'
    ]);

    if (format === 'spaces') {

        return digits
            .replace(/(\d{4})(?=\d)/g, '$1 ')
            .trim();
    }

    if (format === 'dashes') {

        return digits
            .replace(/(\d{4})(?=\d)/g, '$1-')
            .trim();
    }

    return digits;
}


// ============================================================
// NETWORK / DEVICE DATA
// ============================================================

function ipv4() {

    return `${int(1, 223)}.${int(0, 255)}.${int(0, 255)}.${int(1, 254)} `;
}


function ipv6() {

    return Array
        .from(
            { length: 8 },
            () =>
                int(0, 65535)
                    .toString(16)
                    .padStart(4, '0')
        )
        .join(':');
}


function mac() {

    const separator = pick([
        ':',
        '-'
    ]);

    return Array
        .from(
            { length: 6 },
            () =>
                int(0, 255)
                    .toString(16)
                    .padStart(2, '0')
        )
        .join(separator);
}


// ============================================================
// DATE / ADDRESS / IDENTIFIER GENERATORS
// ============================================================

function isoDate() {

    const year = int(1960, 2005);
    const month = int(1, 12);

    const days =
        new Date(year, month, 0).getDate();

    const day = int(1, days);

    return `${year} -${pad(month, 2)} -${pad(day, 2)} `;
}


function usDate() {

    const month = int(1, 12);

    const day =
        int(
            1,
            new Date(2020, month, 0).getDate()
        );

    return `${pad(month, 2)} /${pad(day, 2)}/${int(1960, 2005)} `;
}


function ageValue() {

    return int(1, 99);
}


function streetAddress() {

    const number = int(10, 9999);

    const street = pick([
        'MG Road',
        'Park Avenue',
        'Market Street',
        'Lake View Road',
        'Oak Street',
        'Main Road',
        'Tech Park Avenue',
        'Church Street'
    ]);

    return `${number} ${street} `;
}


function locationUS() {

    return pick([

        'San Jose, CA 95131',

        'Austin, TX 78701',

        'Seattle, WA 98101',

        'Boston, MA 02108',

        'Chicago, IL 60601',

        'Denver, CO 80202'
    ]);
}


function driverLicense() {

    const prefix = pick([
        'A',
        'B',
        'CA',
        'NY',
        'TX'
    ]);

    return `${prefix}${int(10000, 999999999)} `;
}


function passport() {

    return String(
        int(
            100000000,
            999999999
        )
    );
}


function bankAccount() {

    return String(
        int(
            100000000,
            99999999999999
        )
    );
}


function routingNumber() {

    return String(
        int(
            10000000,
            999999999
        )
    );
}


function medicalId() {

    return pick([

        `M${int(100000, 99999999)} `,

        `POL${int(100000, 99999999)} `,

        `INS${int(100000, 99999999)} `
    ]);
}


function vin() {

    const alphabet =
        'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';

    let value = '';

    for (let i = 0; i < 17; i++) {

        value += pick(
            alphabet.split('')
        );
    }

    return value;
}


function coordinates() {

    const lat =
        (random() * 180 - 90)
            .toFixed(4);

    const lon =
        (random() * 360 - 180)
            .toFixed(4);

    return `${lat}°N, ${lon}°E`;
}


function username() {

    return `@${pick([
        'rahul',
        'priya',
        'arjun',
        'dev',
        'admin',
        'suraj'
    ])
        }_${int(1, 9999)} `;
}


function password() {

    return pick([

        `password: ${pick([
            'Tiger',
            'Coffee',
            'Rocket',
            'Nimbus'
        ])
        }${int(100, 9999)} !`,

        `pwd = ${pick([
            'Qwerty',
            'Delta',
            'Alpha',
            'Secure'
        ])
        }${int(10, 9999)}#`,

        `passwd ${pick([
            'Blue',
            'Green',
            'Orange'
        ])
        }${int(1000, 9999)} $`
    ]);
}


// ============================================================
// PII GENERATORS
// ============================================================

const generators = {

    email: {

        category: 'Email',

        make: () => {

            const value = randomEmail();

            return pick([

                `Contact me at ${value} for the project.`,

                `Please send the report to ${value}.`,

                `My personal email is ${value}.`,

                `Account email: ${value} `,

                `Do not expose ${value} to third parties.`
            ]);
        },

        extract: text =>
            text.match(
                /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
            ) || []
    },


    phone: {

        category: 'Phone',

        make: () => {

            const value = pick([
                phoneUS(),
                phoneIndia(),
                phoneInternational()
            ]);

            return pick([

                `Call me at ${value}.`,

                `Emergency contact: ${value} `,

                `Reach the customer on ${value}.`,

                `Phone number = ${value} `
            ]);
        },

        extract: text =>
            text.match(
                /\+?\d[\d ()-]{7,}\d/g
            ) || []
    },


    ssn: {

        category: 'SSN',

        make: () => {

            const value = validSSN();

            return pick([

                `SSN on file: ${value} `,

                `The applicant's SSN is ${value}.`,

                `Do not share SSN ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b\d{3}-\d{2}-\d{4}\b/g
            ) || []
    },


    credit_card: {

        category: 'Credit Card',

        make: () => {

            const value = validCard();

            return pick([

                `Charge the purchase to ${value}.`,

                `Card number: ${value}`,

                `Payment card ${value} is on file.`
            ]);
        },

        extract: text =>
            text.match(
                /\b(?:\d[ -]*?){13,19}\b/g
            ) || []
    },


    ipv4: {

        category: 'IPv4',

        make: () => {

            const value = ipv4();

            return pick([

                `Server IP is ${value}.`,

                `Client connected from ${value}.`,

                `Allowlist ${value} for this test.`
            ]);
        },

        extract: text =>
            text.match(
                /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
            ) || []
    },


    ipv6: {

        category: 'IPv6',

        make: () => {

            const value = ipv6();

            return pick([

                `IPv6 address: ${value}`,

                `The node is reachable at ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g
            ) || []
    },


    mac: {

        category: 'MAC Address',

        make: () => {

            const value = mac();

            return pick([

                `MAC address: ${value}`,

                `Device identifier is ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g
            ) || []
    },


    dob: {

        category: 'Date of Birth',

        make: () => {

            const value = pick([
                isoDate(),
                usDate()
            ]);

            return pick([

                `Date of birth: ${value}`,

                `DOB is ${value}.`,

                `Patient was born on ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})\b/g
            ) || []
    },


    age: {

        category: 'Age',

        make: () =>
            `The patient is ${ageValue()} years old.`,

        extract: text =>
            text.match(
                /\b\d{1,3}\s*(?:years? old|yo|y\/o)\b/gi
            ) || []
    },


    address: {

        category: 'Address',

        make: () => {

            const value = streetAddress();

            return pick([

                `Ship the package to ${value}.`,

                `Home address: ${value}`,

                `Deliver to ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi
            ) || []
    },


    location: {

        category: 'Location',

        make: () => {

            const value = locationUS();

            return pick([

                `Office location: ${value}`,

                `The delivery destination is ${value}.`,

                `I currently live near ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b/g
            ) || []
    },


    driver_license: {

        category: "Driver's License",

        make: () => {

            const value = driverLicense();

            return pick([

                `Driver license: ${value}`,

                `DL number is ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b[A-Z]{1,2}\d{4,9}\b/g
            ) || []
    },


    passport: {

        category: 'Passport',

        make: () => {

            const value = passport();

            return pick([

                `Passport number: ${value}`,

                `Travel document ${value} is confidential.`
            ]);
        },

        extract: text =>
            text.match(
                /\b\d{9}\b/g
            ) || []
    },


    bank_account: {

        category: 'Bank Account',

        make: () => {

            const value = bankAccount();

            return pick([

                `Account: ${value}`,

                `Bank account number ${value} is confidential.`,

                `Acct ${value}`,

                `Routing ${routingNumber()}`
            ]);
        },

        extract: text =>
            text.match(
                /\b(?:account|acct|routing)[:\s]*\d{9,14}\b/gi
            ) || []
    },


    medical_id: {

        category: 'Medical ID',

        make: () => {

            const value = medicalId();

            return pick([

                `Member ID: ${value}`,

                `Insurance ID ${value} belongs to the patient.`,

                `Policy #: ${value}`,

                `Medicare ${value}`
            ]);
        },

        extract: text =>
            text.match(
                /\b(?:member id|policy #|insurance id|medicaid|medicare)[:\s]*[A-Z0-9]{6,12}\b/gi
            ) || []
    },


    vin: {

        category: 'VIN',

        make: () => {

            const value = vin();

            return pick([

                `Vehicle VIN: ${value}`,

                `VIN ${value} is registered to the vehicle.`
            ]);
        },

        extract: text =>
            text.match(
                /\b[A-HJ-NPR-Z0-9]{17}\b/g
            ) || []
    },


    coordinates: {

        category: 'Coordinates',

        make: () => {

            const value = coordinates();

            return pick([

                `Current coordinates: ${value}`,

                `Location pin is ${value}.`
            ]);
        },

        extract: text =>
            text.match(
                /\b-?\d{1,3}\.\d+[°\s]?[NS],?\s*-?\d{1,3}\.\d+[°\s]?[EW]\b/g
            ) || []
    },


    username: {

        category: 'Username',

        make: () => {

            const value = username();

            return pick([

                `My social handle is ${value}.`,

                `Contact ${value} on the platform.`,

                `Username: ${value}`
            ]);
        },

        extract: text =>
            text.match(
                /@[A-Za-z0-9_]+/g
            ) || []
    },


    password: {

        category: 'Password',

        make: () => password(),

        extract: text =>
            text.match(
                /\b(?:password|passwd|pwd)[:\s=]*[^\s]+/gi
            ) || []
    }
};


const TYPE_ORDER =
    Object.keys(generators);


// ============================================================
// SAFE EXAMPLES
// ============================================================

const SAFE_TEMPLATES = [

    [
        'General Query',
        'Can you summarize the main idea of this document?'
    ],

    [
        'General Query',
        'What is the difference between TCP and UDP?'
    ],

    [
        'Normal Text',
        'The meeting starts at 10:30 AM tomorrow.'
    ],

    [
        'Normal Text',
        'The package contains 24 units and weighs 12 kg.'
    ],

    [
        'Math',
        `The answer is x = ${int(1, 999)} * ${pick([
            2,
            3,
            4.2,
            5,
            10
        ])}.`
    ],

    [
        'Math',
        `The result of the benchmark was ${int(0, 100)} percent.`
    ],

    [
        'Code',
        `for (let i = 0; i < ${int(5, 50)}; i++) console.log(i);`
    ],

    [
        'Code',
        `const PORT = ${pick([
            3000,
            4000,
            8080,
            8443
        ])};`
    ],

    [
        'Code',
        `const id = ${int(1000, 9999)};`
    ],

    [
        'Code',
        `const apiUrl = "https://api.example.com/v1/users/${int(1, 999)}";`
    ],

    [
        'URL',
        `Open https://example.com/products/${int(1, 999)} for details.`
    ],

    [
        'URL',
        'Documentation: https://developer.mozilla.org/en-US/'
    ],

    [
        'Order Number',
        `Order ID: #${int(100000, 99999999)}.`
    ],

    [
        'Ticket Number',
        `Support ticket ${int(100000, 999999)} is currently open.`
    ],

    [
        'Version Number',
        `Software version 1.${int(0, 20)}.${int(0, 99)} is installed.`
    ],

    [
        'Date',
        `The release date is ${int(2026, 2027)}-${pad(int(1, 12), 2)}-${pad(int(1, 28), 2)}.`
    ],

    [
        'Time',
        `The build completed at ${pad(int(0, 23), 2)}:${pad(int(0, 59), 2)} UTC.`
    ],

    [
        'Hardware',
        `The processor has ${int(2, 64)} cores and ${int(8, 128)} GB RAM.`
    ],

    [
        'Hardware',
        `The GPU has ${int(4, 24)} GB of VRAM.`
    ],

    [
        'Database',
        'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));'
    ],

    [
        'Database',
        `SELECT * FROM users WHERE id = ${int(1, 999)};`
    ],

    [
        'CSS',
        `.container { width: ${int(100, 900)}px; margin: 0 auto; }`
    ],

    [
        'JSON',
        `{"userId": ${int(1, 999)}, "status": "active"}`
    ],

    [
        'Hex',
        `Memory address 0x${int(100000, 999999).toString(16).toUpperCase()}.`
    ],

    [
        'IPv4-like Number',
        `The subnet mask contains ${pick([
            '255.255.255.0',
            '255.255.0.0'
        ])}.`
    ],

    [
        'Scientific',
        `The sensor measured 1.23e-${int(1, 9)} units.`
    ],

    [
        'Reference',
        `See section ${int(1, 9)}.${int(0, 9)} on page ${int(1, 300)}.`
    ],

    [
        'Academic',
        'The student scored 96 out of 100 on the final examination.'
    ]
];


const ADVERSARIAL_SAFE = [

    [
        'Date Context',
        'The appointment is on 12/10/2026.'
    ],

    [
        'Date Context',
        'Release scheduled for 2026-09-12.'
    ],

    [
        'Phone-like Number',
        `The product code is ${int(100, 999)}-${int(100, 999)}-${int(1000, 9999)}.`
    ],

    [
        'Phone-like Number',
        'The ZIP+4 example is 12345-6789.'
    ],

    [
        'Long Number',
        `Transaction reference ${int(100000000000, 999999999999)} was accepted.`
    ],

    [
        'Long Number',
        `The measurement is ${int(100000000000, 999999999999)}.`
    ],

    [
        '16-digit Number',
        `Internal batch number: ${Array.from(
            { length: 16 },
            () => int(0, 9)
        ).join('')}.`
    ],

    [
        'Code',
        'const phone = "555-123-4567"; // test fixture, not personal data'
    ],

    [
        'Code',
        'const card = "4111 1111 1111 1112"; // intentionally invalid Luhn example'
    ],

    [
        'Username-like',
        'The email parser accepts values such as user_name without treating them as PII.'
    ],

    [
        'At Symbol',
        'Use @media queries in the CSS file.'
    ],

    [
        'URL',
        'Visit https://user:pass@example.com:8080/test for the local fixture.'
    ],

    [
        'MAC-like',
        'The regex test string is AA:BB:CC:DD:EE:FF inside documentation.'
    ],

    [
        'IP-like',
        'The loopback host is 127.0.0.1 in every local development environment.'
    ],

    [
        'Version',
        'Android API level 34 and build 123456789 are not passport numbers.'
    ],

    [
        'VIN-like',
        'ABCDEFGHIJKLMNPRST is an example string used only in documentation.'
    ],

    [
        'Coordinate-like',
        'The parser documentation uses the pattern 12.3456N, 78.9012E as an example.'
    ],

    [
        'Password-like',
        'The word password appears in this documentation paragraph but no secret is present.'
    ],

    [
        'Address-like',
        'The regex example mentions 123 Main Road as a dummy string.'
    ]
];


// ============================================================
// CASE CREATION
// ============================================================

function makeSafeCase(index) {

    const source =
        random() < 0.55
            ? SAFE_TEMPLATES
            : ADVERSARIAL_SAFE;

    const [category, text] =
        pick(source);

    return {

        id: index,

        split:
            index % 10 < 8
                ? 'test'
                : 'challenge',

        text,

        expected_pii: false,

        category,

        entities: [],

        difficulty:
            source === ADVERSARIAL_SAFE
                ? 'adversarial'
                : 'normal',

        source: 'synthetic-safe'
    };
}


function makePiiCase(index, type) {

    const generator =
        generators[type];

    const text =
        generator.make();

    const raw =
        generator.extract(text);

    const entities =
        raw.map(value => ({
            type,
            value
        }));

    return {

        id: index,

        split:
            index % 10 < 8
                ? 'test'
                : 'challenge',

        text,

        expected_pii: true,

        category:
            generator.category,

        entities,

        difficulty:
            raw.length > 1
                ? 'complex'
                : 'normal',

        source: 'synthetic-pii'
    };
}


function makeMixedCase(index) {

    const selected = [];

    const targetCount =
        int(2, 4);

    while (
        selected.length <
        targetCount
    ) {

        const type =
            pick(TYPE_ORDER);

        if (
            !selected.includes(type)
        ) {
            selected.push(type);
        }
    }

    const fragments = [];

    const entities = [];

    for (const type of selected) {

        const generator =
            generators[type];

        const fragment =
            generator.make();

        fragments.push(fragment);

        const extracted =
            generator.extract(fragment);

        for (
            const value
            of extracted
        ) {

            entities.push({
                type,
                value
            });
        }
    }

    const prefix =
        pick([

            'Customer record:',

            'Private support note:',

            'Please sanitize before sending:',

            'Internal test prompt:',

            'User supplied this message:'
        ]);

    return {

        id: index,

        split: 'challenge',

        text:
            `${prefix} ${fragments.join(' ')}`,

        expected_pii: true,

        category: 'Mixed PII',

        entities,

        difficulty: 'mixed',

        source: 'synthetic-mixed'
    };
}


// ============================================================
// DATASET GENERATION
// ============================================================

function generateDataset() {

    const dataset = [];

    let id = 1;


    // --------------------------------------------------------
    // Generate equal amount for every PII type
    // --------------------------------------------------------

    for (
        const type
        of TYPE_ORDER
    ) {

        for (
            let i = 0;
            i < CONFIG.perType;
            i++
        ) {

            dataset.push(
                makePiiCase(
                    id++,
                    type
                )
            );
        }
    }


    // --------------------------------------------------------
    // Generate equal number of safe cases
    // --------------------------------------------------------

    const baseSafeCount =
        TYPE_ORDER.length *
        CONFIG.perType;

    for (
        let i = 0;
        i < baseSafeCount;
        i++
    ) {

        dataset.push(
            makeSafeCase(id++)
        );
    }


    // --------------------------------------------------------
    // Mixed PII challenge examples
    // --------------------------------------------------------

    for (
        let i = 0;
        i < CONFIG.mixedCount;
        i++
    ) {

        dataset.push(
            makeMixedCase(id++)
        );
    }


    // --------------------------------------------------------
    // Shuffle dataset
    // --------------------------------------------------------

    for (
        let i = dataset.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                random() * (i + 1)
            );

        [
            dataset[i],
            dataset[j]
        ] = [
                dataset[j],
                dataset[i]
            ];
    }


    // --------------------------------------------------------
    // Re-number after shuffle
    // --------------------------------------------------------

    dataset.forEach(
        (item, i) => {
            item.id = i + 1;
        }
    );


    return dataset;
}


// ============================================================
// SUMMARY
// ============================================================

function createSummary(dataset) {

    return {

        generator:
            'testing3-browser.js',

        seed:
            CONFIG.seed,

        per_type:
            CONFIG.perType,

        mixed_count:
            CONFIG.mixedCount,

        total:
            dataset.length,

        pii:
            dataset.filter(
                x => x.expected_pii
            ).length,

        safe:
            dataset.filter(
                x => !x.expected_pii
            ).length,

        splits: {

            test:
                dataset.filter(
                    x => x.split === 'test'
                ).length,

            challenge:
                dataset.filter(
                    x => x.split === 'challenge'
                ).length
        },

        categories:
            Object.fromEntries(

                [
                    ...new Set(
                        dataset.map(
                            x => x.category
                        )
                    )
                ]
                    .sort()
                    .map(
                        category => [
                            category,
                            dataset.filter(
                                x =>
                                    x.category ===
                                    category
                            ).length
                        ]
                    )
            ),

        difficulty:
            Object.fromEntries(

                [
                    ...new Set(
                        dataset.map(
                            x => x.difficulty
                        )
                    )
                ]
                    .sort()
                    .map(
                        difficulty => [
                            difficulty,
                            dataset.filter(
                                x =>
                                    x.difficulty ===
                                    difficulty
                            ).length
                        ]
                    )
            )
    };
}


// ============================================================
// BROWSER DOWNLOAD FUNCTION
// ============================================================

function downloadFile(
    filename,
    content,
    mimeType
) {

    const blob =
        new Blob(
            [content],
            {
                type: mimeType
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


// ============================================================
// MAIN
// ============================================================

function runTesting3() {

    console.clear();

    console.log(
        'Generating testing3 dataset...'
    );

    const dataset =
        generateDataset();


    const summary =
        createSummary(dataset);


    // JSON dataset
    const json =
        JSON.stringify(
            dataset,
            null,
            2
        );


    // JS dataset
    const js =
        `const testDataset = ${JSON.stringify(
            dataset,
            null,
            2
        )};\n`;


    // Summary
    const summaryJson =
        JSON.stringify(
            summary,
            null,
            2
        );


    // --------------------------------------------------------
    // Download files
    // --------------------------------------------------------

    downloadFile(
        'testing3-dataset.json',
        json,
        'application/json'
    );


    downloadFile(
        'testing3-dataset.js',
        js,
        'text/javascript'
    );


    downloadFile(
        'testing3-summary.json',
        summaryJson,
        'application/json'
    );


    // --------------------------------------------------------
    // Console output
    // --------------------------------------------------------

    console.log('');
    console.log(
        '✅ testing3 dataset generated successfully'
    );

    console.log(
        `Seed:       ${summary.seed}`
    );

    console.log(
        `PII/type:   ${summary.per_type}`
    );

    console.log(
        `Mixed PII:  ${summary.mixed_count}`
    );

    console.log(
        `Total:      ${summary.total}`
    );

    console.log(
        `PII:        ${summary.pii}`
    );

    console.log(
        `Safe:       ${summary.safe}`
    );

    console.log(
        `Test split: ${summary.splits.test}`
    );

    console.log(
        `Challenge:  ${summary.splits.challenge}`
    );

    console.log('');
    console.log(
        '📁 Three files have been downloaded.'
    );

    console.log('');
    console.log(
        'Files:'
    );

    console.log(
        '1. testing3-dataset.json'
    );

    console.log(
        '2. testing3-dataset.js'
    );

    console.log(
        '3. testing3-summary.json'
    );

    console.log('');
    console.log(
        'Dataset object is also available as:'
    );

    console.log(
        'window.testing3Dataset'
    );


    // Make it available from the browser console
    window.testing3Dataset =
        dataset;

    return dataset;
}


// Automatically run
runTesting3();
