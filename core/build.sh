echo "Building WASM with bindings..."

em++ src/sanitizer.cpp \
    -o ../extension/assets/engine.js \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createEngineModule" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \
    --bind \
    -O3

if [ $? -ne 0 ]; then
    echo "BUILD FAILED"
    exit 1
fi

echo "Build complete!"