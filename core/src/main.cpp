#include <emscripten/bind.h>
#include "sanitizer.h"

using namespace emscripten;

// Expose the Sanitizer class to JavaScript
EMSCRIPTEN_BINDINGS(engine_module) {
    class_<Sanitizer>("Sanitizer")
        .constructor<>()
        .function("process", &Sanitizer::process);
}

int main() {
    return 0; 
}