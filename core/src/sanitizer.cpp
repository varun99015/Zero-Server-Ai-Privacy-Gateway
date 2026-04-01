#include "sanitizer.h"
#include <regex>
#include <string>
#include <emscripten/emscripten.h>

std::string Sanitizer::process(const std::string& input) {
    std::string output = input;

    // 1. Email Redaction
    std::regex email_regex(R"([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})", std::regex_constants::icase);
    output = std::regex_replace(output, email_regex, "EMAIL_1");

    // 2. Phone Number Redaction (Standard 10-digit)
    std::regex phone_regex(R"(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)");
    output = std::regex_replace(output, phone_regex, "PHONE_1");

    // 3. Credit Card / Numerical patterns
    std::regex card_regex(R"(\b(?:\d[ -]*?){13,16}\b)");
    output = std::regex_replace(output, card_regex, "1234 5678 9012 3456");

    return output;
}

extern "C" {

EMSCRIPTEN_KEEPALIVE
const char* process(const char* input) {
    static std::string result;

    Sanitizer s;
    result = s.process(std::string(input));

    return result.c_str();
}

}