#!/bin/bash

echo "Building WASM with bindings..."

emcc src/sanitizer.cpp \
    -o ../extension/assets/engine.js \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createEngineModule" \
    -s ALLOW_MEMORY_GROWTH=1 \
    --bind \
    -O3

echo "Build complete!"