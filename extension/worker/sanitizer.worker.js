importScripts('../assets/engine.js');
importScripts("../utils/fakeGenerator.js");
importScripts("../utils/mapper.js");

let tokenMap = {};

// Load existing mappings once
chrome.storage.local.get(["tokenMap"], (res) => {
    tokenMap = res.tokenMap || {};
});

let engineInstance = null;

// Initialize Wasm Module
Module().then(instance => {
    engineInstance = instance;
    console.log("Zero-Server Engine: Wasm Worker Initialized.");

    queue.forEach(data => self.onmessage({ data }));
    queue = [];
});
