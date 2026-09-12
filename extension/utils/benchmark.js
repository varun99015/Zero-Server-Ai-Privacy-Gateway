// utils/benchmark.js
//
// Zero-Server AI Privacy Gateway
// Benchmark runner for testing3-dataset
//
// IMPORTANT:
// Load testing3-dataset.js BEFORE this file if you want to use
// the generated JS dataset directly.
//
// Expected dataset structure:
//
// const testDataset = [
//   {
//     id: 1,
//     split: "test",
//     text: "...",
//     expected_pii: true,
//     category: "Email",
//     entities: [
//       { type: "email", value: "..." }
//     ]
//   }
// ];
//
// This benchmark measures:
//
// 1. Full preSanitize() classification
// 2. Entity-level detection using WASM detect()
// 3. JS detection-only baseline
// 4. TP / TN / FP / FN
// 5. Accuracy / Precision / Recall / F1
// 6. Average latency
// 7. Per-category metrics
// 8. Challenge-set metrics
// 9. Missed detections and false positives
//
// No Node.js required.
// Intended for your browser / Chrome-extension environment.

(function () {
    "use strict";

    // ============================================================
    // CONFIGURATION
    // ============================================================

    const CONFIG = {
        datasetUrl: "../dataset/testing3-dataset.json",

        // Number of detailed error examples to print.
        maxErrorExamples: 30,

        // Print every result to console when true.
        verbose: false,

        // Run full preSanitize benchmark.
        runFullSanitizer: true,

        // Run C++ WASM detect() benchmark.
        runWasmDetection: true,

        // Run JS regex detection-only benchmark.
        runJsDetection: true,

        // Save a JSON benchmark report if browser allows download.
        downloadReport: true
    };


    // ============================================================
    // GENERAL HELPERS
    // ============================================================

    function round(value, digits = 3) {
        return Number(
            Number(value).toFixed(digits)
        );
    }


    function percentage(value) {
        return `${round(value * 100, 2)}%`;
    }


    function safeLower(value) {
        return String(value || "").toLowerCase();
    }


    function normalizeWhitespace(value) {
        return String(value || "")
            .replace(/\s+/g, " ")
            .trim();
    }


    function nowMs() {
        return performance.now();
    }


    // ============================================================
    // DATASET LOADING
    // ============================================================

    async function loadBenchmarkDataset() {

        // --------------------------------------------------------
        // Option 1:
        // testDataset already exists globally.
        // This is the preferred approach if testing3-dataset.js
        // is loaded before benchmark.js.
        // --------------------------------------------------------

        if (
            Array.isArray(
                self.testDataset
            )
        ) {

            console.log(
                `✅ Using global testDataset: ${self.testDataset.length} cases`
            );

            return self.testDataset;
        }


        // --------------------------------------------------------
        // Option 2:
        // Some browsers / extension environments expose
        // testDataset as a global lexical variable rather than
        // self.testDataset.
        // --------------------------------------------------------

        try {

            if (
                typeof testDataset !== "undefined" &&
                Array.isArray(testDataset)
            ) {

                console.log(
                    `✅ Using loaded testDataset: ${testDataset.length} cases`
                );

                return testDataset;
            }

        } catch (error) {

            // Ignore and continue to fetch JSON.
        }


        // --------------------------------------------------------
        // Option 3:
        // Load the JSON dataset.
        // --------------------------------------------------------

        let url = CONFIG.datasetUrl;


        // Chrome extension support.
        //
        // This only works when the dataset itself is packaged
        // inside the extension.
        //
        // Example:
        //
        // extension/
        // ├── utils/
        // │   └── benchmark.js
        // └── dataset/
        //     └── testing3-dataset.json
        //
        if (
            typeof chrome !== "undefined" &&
            chrome.runtime &&
            typeof chrome.runtime.getURL === "function"
        ) {

            url = chrome.runtime.getURL(
                "dataset/testing3-dataset.json"
            );
        }


        console.log(
            `📂 Loading benchmark dataset from: ${url}`
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Failed to load dataset: HTTP ${response.status}`
            );
        }


        const dataset =
            await response.json();


        if (!Array.isArray(dataset)) {

            throw new Error(
                "Dataset JSON is not an array."
            );
        }


        console.log(
            `✅ Loaded ${dataset.length} benchmark cases`
        );


        return dataset;
    }


    // ============================================================
    // DATASET VALIDATION
    // ============================================================

    function validateDataset(dataset) {

        if (!Array.isArray(dataset)) {

            throw new Error(
                "Dataset must be an array."
            );
        }


        let invalid = 0;


        for (
            const item
            of dataset
        ) {

            if (
                typeof item.id === "undefined" ||
                typeof item.text !== "string" ||
                typeof item.expected_pii !== "boolean"
            ) {

                invalid++;

                console.warn(
                    "⚠️ Invalid dataset item:",
                    item
                );
            }


            if (
                item.expected_pii &&
                !Array.isArray(item.entities)
            ) {

                invalid++;

                console.warn(
                    "⚠️ PII item is missing entities:",
                    item
                );
            }
        }


        if (invalid > 0) {

            console.warn(
                `⚠️ Dataset contains ${invalid} invalid fields.`
            );

        } else {

            console.log(
                "✅ Dataset validation passed."
            );
        }
    }


    // ============================================================
    // DATASET SUMMARY
    // ============================================================

    function summarizeDataset(dataset) {

        const summary = {

            total: dataset.length,

            pii: dataset.filter(
                x => x.expected_pii === true
            ).length,

            safe: dataset.filter(
                x => x.expected_pii === false
            ).length,

            test: dataset.filter(
                x => x.split === "test"
            ).length,

            challenge: dataset.filter(
                x => x.split === "challenge"
            ).length,

            categories: {},

            difficulty: {}
        };


        for (
            const item
            of dataset
        ) {

            const category =
                item.category || "Unknown";

            const difficulty =
                item.difficulty || "Unknown";


            summary.categories[category] =
                (summary.categories[category] || 0) + 1;


            summary.difficulty[difficulty] =
                (summary.difficulty[difficulty] || 0) + 1;
        }


        return summary;
    }


    // ============================================================
    // CONFUSION MATRIX HELPERS
    // ============================================================

    function createConfusionMatrix() {

        return {
            TP: 0,
            TN: 0,
            FP: 0,
            FN: 0
        };
    }


    function calculateMetrics(matrix) {

        const {
            TP,
            TN,
            FP,
            FN
        } = matrix;


        const total =
            TP + TN + FP + FN;


        const accuracy =
            total > 0
                ? (TP + TN) / total
                : 0;


        const precision =
            TP + FP > 0
                ? TP / (TP + FP)
                : 0;


        const recall =
            TP + FN > 0
                ? TP / (TP + FN)
                : 0;


        const specificity =
            TN + FP > 0
                ? TN / (TN + FP)
                : 0;


        const f1 =
            precision + recall > 0
                ? 2 * precision * recall /
                (precision + recall)
                : 0;


        return {

            TP,
            TN,
            FP,
            FN,

            total,

            accuracy,

            precision,

            recall,

            specificity,

            f1,

            errorRate:
                total > 0
                    ? (FP + FN) / total
                    : 0
        };
    }


    // ============================================================
    // DETERMINE WHETHER FULL SANITIZATION HAPPENED
    // ============================================================

    function wasSanitized(
        original,
        scrubbed
    ) {

        return (
            String(scrubbed) !==
            String(original)
        );
    }


    // ============================================================
    // ENTITY MATCHING
    // ============================================================

    function normalizeEntityType(type) {

        const map = {

            email: "email",

            EMAIL: "email",

            phone: "phone",

            PHONE: "phone",

            ssn: "ssn",

            SSN: "ssn",

            credit_card: "credit_card",

            CREDIT_CARD: "credit_card",

            ip: "ip",

            IPv4: "ip",

            ipv4: "ip",

            IPv6: "ip",

            ipv6: "ip",

            mac: "mac",

            MAC: "mac",

            dob: "dob",

            DOB: "dob",

            age: "age",

            AGE: "age",

            address: "address",

            ADDRESS: "address",

            location: "location",

            LOCATION: "location",

            bank: "bank",

            BANK: "bank",

            medical: "medical",

            MEDICAL: "medical",

            passport: "passport",

            PASSPORT: "passport",

            drivers_license: "drivers_license",

            DL: "drivers_license",

            vin: "vin",

            VIN: "vin",

            coordinate: "coordinate",

            COORD: "coordinate",

            username: "username",

            USERNAME: "username",

            password: "password",

            PASSWORD: "password",

            api_key: "api_key",

            API_KEY: "api_key",

            jwt: "jwt",

            JWT: "jwt",

            cloud_secret: "cloud_secret",

            database_secret: "database_secret",

            employee_id: "employee_id",

            name: "name",

            organization: "organization"
        };


        return (
            map[type] ||
            safeLower(type)
        );
    }


    function normalizeEntityValue(value) {

        return normalizeWhitespace(value)
            .toLowerCase();
    }


    function entityKey(entity) {

        return [
            normalizeEntityType(
                entity.type
            ),
            normalizeEntityValue(
                entity.value
            )
        ].join("::");
    }


    function normalizeExpectedEntities(item) {

        if (
            !Array.isArray(
                item.entities
            )
        ) {

            return [];
        }


        return item.entities
            .filter(
                entity =>
                    entity &&
                    typeof entity.value === "string"
            )
            .map(
                entity => ({
                    type:
                        normalizeEntityType(
                            entity.type
                        ),

                    value:
                        normalizeWhitespace(
                            entity.value
                        )
                })
            );
    }


    // ============================================================
    // WASM DETECTION OUTPUT PARSER
    // ============================================================

    function parseWasmDetections(raw) {

        if (
            raw === null ||
            typeof raw === "undefined"
        ) {

            return [];
        }


        const stringValue =
            String(raw);


        if (!stringValue) {
            return [];
        }


        return stringValue
            .split("\x02")
            .filter(Boolean)
            .map(entry => {

                const parts =
                    entry.split("\x01");

                return {

                    type:
                        normalizeEntityType(
                            parts[0]
                        ),

                    value:
                        parts
                            .slice(1)
                            .join("\x01")
                };
            });
    }


    // ============================================================
    // ENTITY MATCHING FOR WASM
    // ============================================================

    function compareEntities(
        expected,
        actual
    ) {

        const expectedKeys =
            new Set(
                expected.map(entityKey)
            );


        const actualKeys =
            new Set(
                actual.map(entityKey)
            );


        let TP = 0;
        let FP = 0;
        let FN = 0;


        for (
            const key
            of actualKeys
        ) {

            if (
                expectedKeys.has(key)
            ) {

                TP++;

            } else {

                FP++;
            }
        }


        for (
            const key
            of expectedKeys
        ) {

            if (
                !actualKeys.has(key)
            ) {

                FN++;
            }
        }


        return {

            TP,
            FP,
            FN,

            expected:
                expectedKeys.size,

            actual:
                actualKeys.size
        };
    }


    // ============================================================
    // FULL preSanitize() BENCHMARK
    // ============================================================

    async function runFullSanitizerBenchmark(
        dataset
    ) {

        console.log("");
        console.log(
            "================================================"
        );
        console.log(
            "FULL preSanitize() BENCHMARK"
        );
        console.log(
            "================================================"
        );


        if (
            typeof self.preSanitize !==
            "function"
        ) {

            console.error(
                "❌ self.preSanitize is not available."
            );

            console.error(
                "Load preSanitize.js before benchmark.js."
            );

            return null;
        }


        const matrix =
            createConfusionMatrix();


        const categoryMatrices = {};


        const errors = [];


        const timings = [];


        for (
            const item
            of dataset
        ) {

            const start =
                nowMs();


            let scrubbedText;


            try {

                scrubbedText =
                    await self.preSanitize(
                        item.text
                    );

            } catch (error) {

                console.error(
                    `❌ Error on case ${item.id}:`,
                    error
                );

                continue;
            }


            const end =
                nowMs();


            const latency =
                end - start;


            timings.push(latency);


            const predicted =
                wasSanitized(
                    item.text,
                    scrubbedText
                );


            const actual =
                item.expected_pii;


            // ----------------------------------------------------
            // Overall confusion matrix
            // ----------------------------------------------------

            if (
                actual &&
                predicted
            ) {

                matrix.TP++;

            } else if (
                actual &&
                !predicted
            ) {

                matrix.FN++;

                if (
                    errors.length <
                    CONFIG.maxErrorExamples
                ) {

                    errors.push({

                        kind: "FN",

                        id: item.id,

                        category:
                            item.category,

                        text:
                            item.text,

                        expected_pii:
                            true,

                        actual_output:
                            scrubbedText
                    });
                }

            } else if (
                !actual &&
                !predicted
            ) {

                matrix.TN++;

            } else if (
                !actual &&
                predicted
            ) {

                matrix.FP++;

                if (
                    errors.length <
                    CONFIG.maxErrorExamples
                ) {

                    errors.push({

                        kind: "FP",

                        id: item.id,

                        category:
                            item.category,

                        text:
                            item.text,

                        expected_pii:
                            false,

                        actual_output:
                            scrubbedText
                    });
                }
            }


            // ----------------------------------------------------
            // Category matrix
            // ----------------------------------------------------

            const category =
                item.category ||
                "Unknown";


            if (
                !categoryMatrices[category]
            ) {

                categoryMatrices[category] =
                    createConfusionMatrix();
            }


            if (
                actual &&
                predicted
            ) {

                categoryMatrices[
                    category
                ].TP++;

            } else if (
                actual &&
                !predicted
            ) {

                categoryMatrices[
                    category
                ].FN++;

            } else if (
                !actual &&
                !predicted
            ) {

                categoryMatrices[
                    category
                ].TN++;

            } else {

                categoryMatrices[
                    category
                ].FP++;
            }


            if (CONFIG.verbose) {

                console.log({

                    id: item.id,

                    expected:
                        actual,

                    predicted,

                    category:

                        item.category,

                    text:
                        item.text,

                    output:
                        scrubbedText
                });
            }
        }


        const metrics =
            calculateMetrics(
                matrix
            );


        const averageLatency =
            timings.length > 0

                ? timings.reduce(
                    (a, b) => a + b,
                    0
                ) / timings.length

                : 0;


        const categoryResults =
            {};


        for (
            const [
                category,
                categoryMatrix
            ]
            of Object.entries(
                categoryMatrices
            )
        ) {

            categoryResults[
                category
            ] =
                calculateMetrics(
                    categoryMatrix
                );
        }


        const result = {

            matrix,

            metrics,

            averageLatencyMs:
                averageLatency,

            minLatencyMs:
                timings.length
                    ? Math.min(...timings)
                    : 0,

            maxLatencyMs:
                timings.length
                    ? Math.max(...timings)
                    : 0,

            categoryResults,

            errors
        };


        printFullSanitizerResults(
            result
        );


        return result;
    }


    // ============================================================
    // PRINT FULL SANITIZER RESULTS
    // ============================================================

    function printFullSanitizerResults(
        result
    ) {

        const {
            metrics,
            averageLatencyMs,
            minLatencyMs,
            maxLatencyMs,
            categoryResults,
            errors
        } = result;


        console.log("");
        console.log(
            "📊 FULL SANITIZER RESULTS"
        );
        console.log(
            "------------------------------------------------"
        );


        printMetricLine(
            "True Positives",
            metrics.TP
        );

        printMetricLine(
            "True Negatives",
            metrics.TN
        );

        printMetricLine(
            "False Positives",
            metrics.FP
        );

        printMetricLine(
            "False Negatives",
            metrics.FN
        );


        console.log("");


        printMetricLine(
            "Accuracy",
            percentage(
                metrics.accuracy
            )
        );

        printMetricLine(
            "Precision",
            percentage(
                metrics.precision
            )
        );

        printMetricLine(
            "Recall",
            percentage(
                metrics.recall
            )
        );

        printMetricLine(
            "Specificity",
            percentage(
                metrics.specificity
            )
        );

        printMetricLine(
            "F1 Score",
            percentage(
                metrics.f1
            )
        );


        console.log("");


        printMetricLine(
            "Average latency",
            `${round(
                averageLatencyMs,
                3
            )} ms`
        );

        printMetricLine(
            "Minimum latency",
            `${round(
                minLatencyMs,
                3
            )} ms`
        );

        printMetricLine(
            "Maximum latency",
            `${round(
                maxLatencyMs,
                3
            )} ms`
        );


        // --------------------------------------------------------
        // Per-category results
        // --------------------------------------------------------

        console.log("");
        console.log(
            "📚 CATEGORY RESULTS"
        );
        console.log(
            "------------------------------------------------"
        );


        const categoryNames =
            Object.keys(
                categoryResults
            ).sort();


        console.table(

            categoryNames.map(
                category => {

                    const m =
                        categoryResults[
                        category
                        ];


                    return {

                        Category:
                            category,

                        TP:
                            m.TP,

                        TN:
                            m.TN,

                        FP:
                            m.FP,

                        FN:
                            m.FN,

                        Accuracy:
                            percentage(
                                m.accuracy
                            ),

                        Precision:
                            percentage(
                                m.precision
                            ),

                        Recall:
                            percentage(
                                m.recall
                            ),

                        F1:
                            percentage(
                                m.f1
                            )
                    };
                }
            )
        );


        // --------------------------------------------------------
        // Errors
        // --------------------------------------------------------

        if (
            errors.length > 0
        ) {

            console.log("");
            console.log(
                `⚠️ Error examples (${errors.length})`
            );


            for (
                const error
                of errors
            ) {

                if (
                    error.kind === "FN"
                ) {

                    console.warn(
                        `❌ FALSE NEGATIVE | ${error.category} | #${error.id}`
                    );

                } else {

                    console.warn(
                        `⚠️ FALSE POSITIVE | ${error.category} | #${error.id}`
                    );
                }


                console.warn(
                    "Input:",
                    error.text
                );

                console.warn(
                    "Output:",
                    error.actual_output
                );

                console.log("");
            }
        }
    }


    function printMetricLine(
        name,
        value
    ) {

        console.log(
            `${name.padEnd(20)}: ${value}`
        );
    }


    // ============================================================
    // WASM DETECTION BENCHMARK
    // ============================================================

    async function runWasmDetectionBenchmark(
        dataset
    ) {

        console.log("");
        console.log(
            "================================================"
        );
        console.log(
            "WASM detect() BENCHMARK"
        );
        console.log(
            "================================================"
        );


        if (
            typeof engineInstance ===
            "undefined" ||
            !engineInstance
        ) {

            console.warn(
                "⚠️ engineInstance is not available."
            );

            return null;
        }


        if (
            typeof engineInstance.ccall !==
            "function"
        ) {

            console.error(
                "❌ engineInstance.ccall is not available."
            );

            return null;
        }


        const entityMatrix = {

            TP: 0,

            FP: 0,

            FN: 0
        };


        const binaryMatrix =
            createConfusionMatrix();


        const categoryEntityStats =
            {};


        const timings = [];


        const errors = [];


        for (
            const item
            of dataset
        ) {

            const start =
                nowMs();


            let raw;


            try {

                raw =
                    engineInstance.ccall(
                        "detect",
                        "string",
                        ["string"],
                        [item.text]
                    );

            } catch (error) {

                console.error(
                    `❌ WASM error on case ${item.id}:`,
                    error
                );

                continue;
            }


            const end =
                nowMs();


            timings.push(
                end - start
            );


            const actualEntities =
                parseWasmDetections(
                    raw
                );


            const expectedEntities =
                normalizeExpectedEntities(
                    item
                );


            const comparison =
                compareEntities(
                    expectedEntities,
                    actualEntities
                );


            entityMatrix.TP +=
                comparison.TP;

            entityMatrix.FP +=
                comparison.FP;

            entityMatrix.FN +=
                comparison.FN;


            // Binary PII classification:
            //
            // expected PII if there is at least
            // one expected entity.
            //
            // predicted PII if detect() returned
            // at least one entity.

            const expectedPII =
                expectedEntities.length > 0;

            const predictedPII =
                actualEntities.length > 0;


            if (
                expectedPII &&
                predictedPII
            ) {

                binaryMatrix.TP++;

            } else if (
                expectedPII &&
                !predictedPII
            ) {

                binaryMatrix.FN++;

            } else if (
                !expectedPII &&
                predictedPII
            ) {

                binaryMatrix.FP++;

            } else {

                binaryMatrix.TN++;
            }


            // ----------------------------------------------------
            // Category statistics
            // ----------------------------------------------------

            const category =
                item.category ||
                "Unknown";


            if (
                !categoryEntityStats[
                category
                ]
            ) {

                categoryEntityStats[
                    category
                ] = {

                    expected: 0,

                    detected: 0,

                    TP: 0,

                    FP: 0,

                    FN: 0
                };
            }


            categoryEntityStats[
                category
            ].expected +=
                comparison.expected;


            categoryEntityStats[
                category
            ].detected +=
                comparison.actual;


            categoryEntityStats[
                category
            ].TP +=
                comparison.TP;


            categoryEntityStats[
                category
            ].FP +=
                comparison.FP;


            categoryEntityStats[
                category
            ].FN +=
                comparison.FN;


            // ----------------------------------------------------
            // Error examples
            // ----------------------------------------------------

            if (
                (
                    comparison.FP > 0 ||
                    comparison.FN > 0
                ) &&
                errors.length <
                CONFIG.maxErrorExamples
            ) {

                errors.push({

                    id:
                        item.id,

                    category:
                        item.category,

                    text:
                        item.text,

                    expected:
                        expectedEntities,

                    actual:
                        actualEntities
                });
            }


            if (
                CONFIG.verbose
            ) {

                console.log({

                    id:
                        item.id,

                    expected:
                        expectedEntities,

                    actual:
                        actualEntities
                });
            }
        }


        // --------------------------------------------------------
        // Entity-level metrics
        // --------------------------------------------------------

        const entityPrecision =
            entityMatrix.TP +
                entityMatrix.FP > 0

                ? entityMatrix.TP /
                (
                    entityMatrix.TP +
                    entityMatrix.FP
                )

                : 0;


        const entityRecall =
            entityMatrix.TP +
                entityMatrix.FN > 0

                ? entityMatrix.TP /
                (
                    entityMatrix.TP +
                    entityMatrix.FN
                )

                : 0;


        const entityF1 =
            entityPrecision +
                entityRecall > 0

                ? 2 *
                entityPrecision *
                entityRecall /
                (
                    entityPrecision +
                    entityRecall
                )

                : 0;


        const binaryMetrics =
            calculateMetrics(
                binaryMatrix
            );


        const avg =
            timings.length > 0

                ? timings.reduce(
                    (a, b) => a + b,
                    0
                ) / timings.length

                : 0;


        const result = {

            entity: {

                TP:
                    entityMatrix.TP,

                FP:
                    entityMatrix.FP,

                FN:
                    entityMatrix.FN,

                precision:
                    entityPrecision,

                recall:
                    entityRecall,

                f1:
                    entityF1
            },

            binary:
                binaryMetrics,

            averageLatencyMs:
                avg,

            categoryEntityStats,

            errors
        };


        printWasmResults(
            result
        );


        return result;
    }


    // ============================================================
    // PRINT WASM RESULTS
    // ============================================================

    function printWasmResults(
        result
    ) {

        console.log("");
        console.log(
            "🧪 WASM ENTITY-LEVEL RESULTS"
        );
        console.log(
            "------------------------------------------------"
        );


        printMetricLine(
            "Entity TP",
            result.entity.TP
        );

        printMetricLine(
            "Entity FP",
            result.entity.FP
        );

        printMetricLine(
            "Entity FN",
            result.entity.FN
        );

        printMetricLine(
            "Entity Precision",
            percentage(
                result.entity.precision
            )
        );

        printMetricLine(
            "Entity Recall",
            percentage(
                result.entity.recall
            )
        );

        printMetricLine(
            "Entity F1",
            percentage(
                result.entity.f1
            )
        );


        console.log("");
        console.log(
            "🧪 WASM BINARY PII RESULTS"
        );
        console.log(
            "------------------------------------------------"
        );


        printMetricLine(
            "TP",
            result.binary.TP
        );

        printMetricLine(
            "TN",
            result.binary.TN
        );

        printMetricLine(
            "FP",
            result.binary.FP
        );

        printMetricLine(
            "FN",
            result.binary.FN
        );

        printMetricLine(
            "Accuracy",
            percentage(
                result.binary.accuracy
            )
        );

        printMetricLine(
            "Precision",
            percentage(
                result.binary.precision
            )
        );

        printMetricLine(
            "Recall",
            percentage(
                result.binary.recall
            )
        );

        printMetricLine(
            "F1",
            percentage(
                result.binary.f1
            )
        );


        console.log("");
        printMetricLine(
            "Average latency",
            `${round(
                result.averageLatencyMs,
                3
            )} ms`
        );


        console.log("");
        console.log(
            "📚 WASM CATEGORY ENTITY RESULTS"
        );
        console.log(
            "------------------------------------------------"
        );


        console.table(

            Object.entries(
                result.categoryEntityStats
            )
                .sort(
                    ([a], [b]) =>
                        a.localeCompare(b)
                )
                .map(
                    ([category, value]) => {

                        const precision =
                            value.TP +
                                value.FP > 0

                                ? value.TP /
                                (
                                    value.TP +
                                    value.FP
                                )

                                : 0;


                        const recall =
                            value.TP +
                                value.FN > 0

                                ? value.TP /
                                (
                                    value.TP +
                                    value.FN
                                )

                                : 0;


                        const f1 =
                            precision +
                                recall > 0

                                ? 2 *
                                precision *
                                recall /
                                (
                                    precision +
                                    recall
                                )

                                : 0;


                        return {

                            Category:
                                category,

                            Expected:
                                value.expected,

                            Detected:
                                value.detected,

                            TP:
                                value.TP,

                            FP:
                                value.FP,

                            FN:
                                value.FN,

                            Precision:
                                percentage(
                                    precision
                                ),

                            Recall:
                                percentage(
                                    recall
                                ),

                            F1:
                                percentage(
                                    f1
                                )
                        };
                    }
                )
        );


        if (
            result.errors.length
        ) {

            console.log("");
            console.log(
                `⚠️ WASM entity mismatches (${result.errors.length})`
            );


            for (
                const error
                of result.errors
            ) {

                console.warn(
                    `#${error.id} | ${error.category}`
                );

                console.warn(
                    "Input:",
                    error.text
                );

                console.warn(
                    "Expected:",
                    error.expected
                );

                console.warn(
                    "Actual:",
                    error.actual
                );

                console.log("");
            }
        }
    }


    // ============================================================
    // JAVASCRIPT DETECTION-ONLY BENCHMARK
    // ============================================================

    function luhnCheck(
        value
    ) {

        const digits =
            String(value)
                .replace(/\D/g, "");


        if (
            digits.length < 13 ||
            digits.length > 19
        ) {

            return false;
        }


        let sum = 0;
        let alternate = false;


        for (
            let i =
                digits.length - 1;
            i >= 0;
            i--
        ) {

            let n =
                Number(
                    digits[i]
                );


            if (
                alternate
            ) {

                n *= 2;

                if (
                    n > 9
                ) {

                    n -= 9;
                }
            }


            sum += n;

            alternate =
                !alternate;
        }


        return (
            sum % 10 === 0
        );
    }


    function getStructuredJsDetectors() {

        // These match the structured detectors
        // used by your existing benchmark/preSanitize
        // implementation.

        return [

            {
                regex:
                    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

                type:
                    "email"
            },


            {
                regex:
                    /\b(?:\+?1[ .-]?)?\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}\b|\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{1,4}[ .-]?\d{1,9}\b/g,

                type:
                    "phone"
            },


            {
                regex:
                    /\b\d{3}-\d{2}-\d{4}\b/g,

                type:
                    "ssn"
            },


            {
                regex:
                    /\b(?:\d[ -]*?){13,19}\b/g,

                type:
                    "credit_card",

                validate:
                    luhnCheck
            },


            {
                regex:
                    /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b/g,

                type:
                    "ip"
            },


            {
                regex:
                    /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/g,

                type:
                    "mac"
            }
        ];
    }


    function runJsDetectionOnlyBenchmark(
        dataset
    ) {

        console.log("");
        console.log(
            "================================================"
        );
        console.log(
            "JAVASCRIPT DETECTION-ONLY BENCHMARK"
        );
        console.log(
            "================================================"
        );


        const detectors =
            getStructuredJsDetectors();


        const timings = [];


        const binaryMatrix =
            createConfusionMatrix();


        const detectedExamples = [];


        for (
            const item
            of dataset
        ) {

            const start =
                nowMs();


            let detected =
                false;


            const detections =
                [];


            for (
                const detector
                of detectors
            ) {

                detector.regex.lastIndex =
                    0;


                let match;


                while (
                    (
                        match =
                        detector.regex.exec(
                            item.text
                        )
                    ) !== null
                ) {

                    if (
                        detector.validate &&
                        !detector.validate(
                            match[0]
                        )
                    ) {

                        continue;
                    }


                    detected = true;


                    detections.push({

                        type:
                            detector.type,

                        value:
                            match[0]
                    });
                }
            }


            const end =
                nowMs();


            timings.push(
                end - start
            );


            const expected =
                item.expected_pii;


            if (
                expected &&
                detected
            ) {

                binaryMatrix.TP++;

            } else if (
                expected &&
                !detected
            ) {

                binaryMatrix.FN++;

            } else if (
                !expected &&
                detected
            ) {

                binaryMatrix.FP++;

                if (
                    detectedExamples.length <
                    CONFIG.maxErrorExamples
                ) {

                    detectedExamples.push({

                        type:
                            "FP",

                        id:
                            item.id,

                        category:
                            item.category,

                        text:
                            item.text,

                        detections
                    });
                }

            } else {

                binaryMatrix.TN++;
            }
        }


        const metrics =
            calculateMetrics(
                binaryMatrix
            );


        const avg =
            timings.length > 0

                ? timings.reduce(
                    (a, b) => a + b,
                    0
                ) / timings.length

                : 0;


        const result = {

            metrics,

            averageLatencyMs:
                avg,

            detections:
                detectedExamples
        };


        console.log("");
        console.log(
            "📊 JS DETECTION RESULTS"
        );
        console.log(
            "------------------------------------------------"
        );


        printMetricLine(
            "TP",
            metrics.TP
        );

        printMetricLine(
            "TN",
            metrics.TN
        );

        printMetricLine(
            "FP",
            metrics.FP
        );

        printMetricLine(
            "FN",
            metrics.FN
        );

        printMetricLine(
            "Accuracy",
            percentage(
                metrics.accuracy
            )
        );

        printMetricLine(
            "Precision",
            percentage(
                metrics.precision
            )
        );

        printMetricLine(
            "Recall",
            percentage(
                metrics.recall
            )
        );

        printMetricLine(
            "F1",
            percentage(
                metrics.f1
            )
        );

        printMetricLine(
            "Average latency",
            `${round(
                avg,
                3
            )} ms`
        );


        if (
            detectedExamples.length
        ) {

            console.log("");
            console.warn(
                "⚠️ JS false-positive examples:"
            );


            for (
                const item
                of detectedExamples
            ) {

                console.warn(
                    item
                );
            }
        }


        return result;
    }


    // ============================================================
    // CHALLENGE-SET BENCHMARK
    // ============================================================

    async function runChallengeBenchmark(
        dataset
    ) {

        const challenge =
            dataset.filter(
                item =>
                    item.split ===
                    "challenge"
            );


        if (
            challenge.length === 0
        ) {

            console.warn(
                "⚠️ No challenge cases found."
            );

            return null;
        }


        console.log("");
        console.log(
            "================================================"
        );
        console.log(
            `CHALLENGE SET (${challenge.length} cases)`
        );
        console.log(
            "================================================"
        );


        let result = null;


        if (
            CONFIG.runFullSanitizer
        ) {

            result =
                await runFullSanitizerBenchmark(
                    challenge
                );
        }


        return result;
    }


    // ============================================================
    // REPORT DOWNLOAD
    // ============================================================

    function downloadJsonReport(
        report
    ) {

        if (
            !CONFIG.downloadReport
        ) {

            return;
        }


        try {

            const json =
                JSON.stringify(
                    report,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;

            link.download =
                "zero-server-benchmark-results.json";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );


            console.log(
                "💾 Benchmark report downloaded:"
            );

            console.log(
                "zero-server-benchmark-results.json"
            );

        } catch (error) {

            console.warn(
                "⚠️ Could not download report:",
                error
            );
        }
    }


    // ============================================================
    // MAIN BENCHMARK
    // ============================================================

    async function runCompleteBenchmark() {

        console.clear();


        console.log(
            "🚀 ZERO-SERVER AI PRIVACY GATEWAY"
        );

        console.log(
            "🚀 COMPLETE BENCHMARK"
        );

        console.log(
            "================================================"
        );


        // --------------------------------------------------------
        // Load dataset
        // --------------------------------------------------------

        let dataset;


        try {

            dataset =
                await loadBenchmarkDataset();

        } catch (error) {

            console.error(
                "❌ Dataset loading failed:"
            );

            console.error(
                error
            );

            return null;
        }


        validateDataset(
            dataset
        );


        const datasetSummary =
            summarizeDataset(
                dataset
            );


        // --------------------------------------------------------
        // Dataset summary
        // --------------------------------------------------------

        console.log("");
        console.log(
            "📦 DATASET SUMMARY"
        );

        console.log(
            "------------------------------------------------"
        );

        console.log(
            `Total cases     : ${datasetSummary.total}`
        );

        console.log(
            `PII cases       : ${datasetSummary.pii}`
        );

        console.log(
            `Safe cases      : ${datasetSummary.safe}`
        );

        console.log(
            `Test cases      : ${datasetSummary.test}`
        );

        console.log(
            `Challenge cases : ${datasetSummary.challenge}`
        );


        // --------------------------------------------------------
        // Full sanitizer
        // --------------------------------------------------------

        let fullSanitizerResult =
            null;


        if (
            CONFIG.runFullSanitizer
        ) {

            fullSanitizerResult =
                await runFullSanitizerBenchmark(
                    dataset
                );
        }


        // --------------------------------------------------------
        // WASM
        // --------------------------------------------------------

        let wasmResult =
            null;


        if (
            CONFIG.runWasmDetection
        ) {

            wasmResult =
                await runWasmDetectionBenchmark(
                    dataset
                );
        }


        // --------------------------------------------------------
        // JS baseline
        // --------------------------------------------------------

        let jsResult =
            null;


        if (
            CONFIG.runJsDetection
        ) {

            jsResult =
                runJsDetectionOnlyBenchmark(
                    dataset
                );
        }


        // --------------------------------------------------------
        // Challenge
        // --------------------------------------------------------

        let challengeResult =
            null;


        if (
            CONFIG.runFullSanitizer
        ) {

            challengeResult =
                await runChallengeBenchmark(
                    dataset
                );
        }


        // --------------------------------------------------------
        // Final report
        // --------------------------------------------------------

        const report = {

            generatedAt:
                new Date().toISOString(),

            configuration:
                CONFIG,

            dataset:
                datasetSummary,

            fullSanitizer:
                fullSanitizerResult,

            wasm:
                wasmResult,

            javascriptDetection:
                jsResult,

            challenge:
                challengeResult
        };


        // --------------------------------------------------------
        // Final compact summary
        // --------------------------------------------------------

        console.log("");
        console.log(
            "================================================"
        );

        console.log(
            "🏁 FINAL BENCHMARK SUMMARY"
        );

        console.log(
            "================================================"
        );


        if (
            fullSanitizerResult
        ) {

            const m =
                fullSanitizerResult.metrics;


            console.log("");
            console.log(
                "FULL SANITIZER"
            );

            console.log(
                `Accuracy  : ${percentage(
                    m.accuracy
                )}`
            );

            console.log(
                `Precision : ${percentage(
                    m.precision
                )}`
            );

            console.log(
                `Recall    : ${percentage(
                    m.recall
                )}`
            );

            console.log(
                `F1        : ${percentage(
                    m.f1
                )}`
            );

            console.log(
                `Latency   : ${round(
                    fullSanitizerResult.averageLatencyMs,
                    3
                )} ms`
            );
        }


        if (
            wasmResult
        ) {

            console.log("");
            console.log(
                "WASM ENTITY DETECTION"
            );

            console.log(
                `Precision : ${percentage(
                    wasmResult.entity.precision
                )}`
            );

            console.log(
                `Recall    : ${percentage(
                    wasmResult.entity.recall
                )}`
            );

            console.log(
                `F1        : ${percentage(
                    wasmResult.entity.f1
                )}`
            );

            console.log(
                `Latency   : ${round(
                    wasmResult.averageLatencyMs,
                    3
                )} ms`
            );
        }


        if (
            jsResult
        ) {

            console.log("");
            console.log(
                "JS DETECTION"
            );

            console.log(
                `Accuracy  : ${percentage(
                    jsResult.metrics.accuracy
                )}`
            );

            console.log(
                `Precision : ${percentage(
                    jsResult.metrics.precision
                )}`
            );

            console.log(
                `Recall    : ${percentage(
                    jsResult.metrics.recall
                )}`
            );

            console.log(
                `F1        : ${percentage(
                    jsResult.metrics.f1
                )}`
            );

            console.log(
                `Latency   : ${round(
                    jsResult.averageLatencyMs,
                    3
                )} ms`
            );
        }


        console.log("");
        console.log(
            "✅ Benchmark complete."
        );


        // --------------------------------------------------------
        // Expose results globally
        // --------------------------------------------------------

        self.zeroServerBenchmarkReport =
            report;


        self.zeroServerBenchmarkDataset =
            dataset;


        // --------------------------------------------------------
        // Download report
        // --------------------------------------------------------

        downloadJsonReport(
            report
        );


        return report;
    }


    // ============================================================
    // EXPOSE FUNCTIONS
    // ============================================================

    self.runCompleteBenchmark =
        runCompleteBenchmark;


    self.runMetricsBenchmark =
        runCompleteBenchmark;


    self.runFullSanitizerBenchmark =
        runFullSanitizerBenchmark;


    self.runWasmDetectionBenchmark =
        runWasmDetectionBenchmark;


    self.runJsDetectionOnlyBenchmark =
        runJsDetectionOnlyBenchmark;


    self.runChallengeBenchmark =
        runChallengeBenchmark;


    self.parseWasmDetections =
        parseWasmDetections;


    self.calculateBenchmarkMetrics =
        calculateMetrics;


    // ============================================================
    // DO NOT AUTO-RUN
    // ============================================================
    //
    // We intentionally do NOT call runCompleteBenchmark()
    // automatically.
    //
    // Reason:
    // Your WASM engine and preSanitize() may not be ready when
    // benchmark.js is loaded.
    //
    // Run it manually from the browser console:
    //
    //     runCompleteBenchmark()
    //
    // after your extension has finished loading.
    //
    // ============================================================


    console.log(
        "✅ benchmark.js loaded."
    );

    console.log(
        "Run: runCompleteBenchmark()"
    );

})();