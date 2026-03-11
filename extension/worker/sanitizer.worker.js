importScripts('../assets/engine.js');

let engineInstance = null;

// Initialize Wasm Module
Module().then(instance => {
    engineInstance = new instance.Sanitizer();
    console.log("Zero-Server Engine: Wasm Worker Initialized.");
});

self.onmessage = function(e) {
    const { text, id } = e.data;
    
    if (engineInstance && text) {
        // High-performance C++ scanning
        const scrubbedText = engineInstance.process(text);
        self.postMessage({ scrubbedText, id });
    } else {
        // Fallback if engine isn't ready
        self.postMessage({ scrubbedText: text, id });
    }
};