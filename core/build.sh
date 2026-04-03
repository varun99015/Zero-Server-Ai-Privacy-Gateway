#!/bin/bash

echo "Building WASM..."

emcc src/sanitizer.cpp \
    -o ../extension/assets/engine.js \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createEngineModule" \
    -s EXPORTED_FUNCTIONS='["_process"]' ^
    -s EXPORTED_RUNTIME_METHODS='["ccall"]'
    -s ALLOW_MEMORY_GROWTH=1 \
    -O3

echo "Build complete!"