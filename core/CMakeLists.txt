cmake_minimum_required(VERSION 3.10)
project(ZeroServerEngine)

set(CMAKE_CXX_STANDARD 20)

# Critical flags for your project's sub-50ms latency goal
set(EMSCRIPTEN_FLAGS "-O3 -msimd128 -mrelaxed-simd --bind -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap'] -s MODULARIZE=1 -s EXPORT_ES6=1 -s ALLOW_MEMORY_GROWTH=1")

add_executable(engine 
    ${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp 
    ${CMAKE_CURRENT_SOURCE_DIR}/src/sanitizer.cpp
)

set_target_properties(engine PROPERTIES LINK_FLAGS "${EMSCRIPTEN_FLAGS}")

# Output directly to the extension assets folder
set_target_properties(engine PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/../extension/assets")