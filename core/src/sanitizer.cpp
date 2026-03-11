#include "sanitizer.h"
#include <regex>
#include <string>

std::string Sanitizer::process(const std::string& input) {
    std::string output = input;

    // 1. Email Redaction
    std::regex email_regex(R"([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})", std::regex_constants::icase);
    output = std::regex_replace(output, email_regex, "[EMAIL_HIDDEN]");

    // 2. Phone Number Redaction (Standard 10-digit)
    std::regex phone_regex(R"(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)");
    output = std::regex_replace(output, phone_regex, "[PHONE_HIDDEN]");

    // 3. Credit Card / Numerical patterns
    std::regex card_regex(R"(\b(?:\d[ -]*?){13,16}\b)");
    output = std::regex_replace(output, card_regex, "[SENSITIVE_NUM_HIDDEN]");

    return output;
}