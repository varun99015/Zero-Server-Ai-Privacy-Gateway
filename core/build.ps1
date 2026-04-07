cd D:\MY_FILE\COLLEGE\Projects\emsdk
.\emsdk_env.ps1

cd ..\Zero-Server-Ai-Privacy-Gateway\core

emcc src/sanitizer.cpp `
  -o ../extension/assets/engine.js `
  -s WASM=1 `
  -s MODULARIZE=1 `
  -s EXPORT_NAME="createEngineModule" `
  -s ALLOW_MEMORY_GROWTH=1 `
  --bind `
  -O3

Write-Host "Build complete!"



# Now build with ONE command
# From core/:

# .\build.ps1