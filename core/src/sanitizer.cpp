#include "sanitizer.h"
#include <regex>
#include <string>
#include <algorithm>
#include <cctype>

// Helper to remove non-digit characters for Luhn check
static std::string digitsOnly(const std::string& s) {
    std::string result;
    for (char c : s) {
        if (std::isdigit(c)) result.push_back(c);
    }
    return result;
}

bool Sanitizer::luhnCheck(const std::string& cardNumber) {
    std::string digits = digitsOnly(cardNumber);
    if (digits.length() < 13 || digits.length() > 19) return false;

    int sum = 0;
    bool alternate = false;
    for (int i = digits.length() - 1; i >= 0; --i) {
        int n = digits[i] - '0';
        if (alternate) {
            n *= 2;
            if (n > 9) n = (n % 10) + 1;
        }
        sum += n;
        alternate = !alternate;
    }
    return (sum % 10 == 0);
}

bool Sanitizer::isCreditCardNumber(const std::string& s) {
    std::string digits = digitsOnly(s);
    return (digits.length() >= 13 && digits.length() <= 19) && luhnCheck(s);
}

std::string Sanitizer::process(const std::string& input) {
    std::string output = input;

    // ========== 1. Email ==========
    std::regex email_regex(R"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})");
    output = std::regex_replace(output, email_regex, "[EMAIL_HIDDEN]");

    // ========== 2. Phone numbers (US and international) ==========
    // US: (123) 456-7890, 123-456-7890, 123.456.7890, +1 123 456 7890
    std::regex us_phone(R"(\b(?:\+?1[ .-]?)?\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}\b)");
    output = std::regex_replace(output, us_phone, "[PHONE_HIDDEN]");

    // International (simplified): +CC XXX XXX XXX
    std::regex intl_phone(R"(\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{1,4}[ .-]?\d{1,9}\b)");
    output = std::regex_replace(output, intl_phone, "[PHONE_HIDDEN]");

    // ========== 3. SSN (US) ==========
    std::regex ssn_regex(R"(\b\d{3}-\d{2}-\d{4}\b)");
    output = std::regex_replace(output, ssn_regex, "[SSN_HIDDEN]");

    // ========== 4. Credit card numbers (with Luhn validation) ==========
    // Match potential card numbers (13-19 digits, with optional spaces/dashes)
    std::regex card_candidate(R"(\b(?:\d[ -]*?){13,19}\b)");
    std::smatch match;
    std::string temp = output;
    std::string result;
    size_t lastPos = 0;
    while (std::regex_search(temp, match, card_candidate)) {
        result += match.prefix().str();
        std::string candidate = match.str();
        if (isCreditCardNumber(candidate)) {
            result += "[CREDIT_CARD_HIDDEN]";
        } else {
            result += candidate; // keep as is
        }
        temp = match.suffix().str();
    }
    result += temp;
    output = result;

    // ========== 5. IP addresses ==========
    // IPv4
    std::regex ipv4(R"(\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b)");
    output = std::regex_replace(output, ipv4, "[IP_HIDDEN]");
    // IPv6 (simplified)
    std::regex ipv6(R"(\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b)");
    output = std::regex_replace(output, ipv6, "[IP_HIDDEN]");

    // ========== 6. MAC addresses ==========
    std::regex mac(R"(\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b)");
    output = std::regex_replace(output, mac, "[MAC_HIDDEN]");

    // ========== 7. Dates of birth (multiple formats) ==========
    // YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, etc.
    std::regex dob1(R"(\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b)");
    std::regex dob2(R"(\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b)");
    output = std::regex_replace(output, dob1, "[DOB_HIDDEN]");
    output = std::regex_replace(output, dob2, "[DOB_HIDDEN]");

    // ========== 8. Age expressions ==========
    std::regex age(R"(\b\d{1,3}\s*(years? old|yo|y/o)\b)");
    output = std::regex_replace(output, age, "[AGE_HIDDEN]");

    // ========== 9. US street addresses (basic) ==========
    std::regex street(R"(\b\d{1,5}\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b)");
    output = std::regex_replace(output, street, "[ADDRESS_HIDDEN]");

    // ========== 10. City, State, ZIP ==========
    std::regex city_state_zip(R"(\b[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b)");
    output = std::regex_replace(output, city_state_zip, "[LOCATION_HIDDEN]");

    // ========== 11. Driver's license (simple pattern) ==========
    std::regex drivers_license(R"(\b[A-Z]{1,2}\d{4,9}\b)");
    output = std::regex_replace(output, drivers_license, "[DL_HIDDEN]");

    // ========== 12. Passport number (US 9-digit) ==========
    std::regex passport(R"(\b\d{9}\b)");
    output = std::regex_replace(output, passport, "[PASSPORT_HIDDEN]");

    // ========== 13. Bank account / routing numbers (with keywords) ==========
    // Look for "account" or "routing" followed by digits
    std::regex bank_acct(R"(\b(?:account|acct|routing)[:\s]*(\d{9,14})\b)", std::regex_constants::icase);
    output = std::regex_replace(output, bank_acct, "[BANK_ACCOUNT_HIDDEN]");

    // ========== 14. Medical ID / insurance numbers ==========
    std::regex medical_id(R"(\b(?:member id|policy #|insurance id|medicaid|medicare)[:\s]*([A-Z0-9]{6,12})\b)", std::regex_constants::icase);
    output = std::regex_replace(output, medical_id, "[MEDICAL_ID_HIDDEN]");

    // ========== 15. VIN (Vehicle Identification Number) ==========
    std::regex vin(R"(\b[A-HJ-NPR-Z0-9]{17}\b)");
    output = std::regex_replace(output, vin, "[VIN_HIDDEN]");

    // ========== 16. Geolocation coordinates ==========
    std::regex coords(R"(\b-?\d{1,3}\.\d+[°\s]?[NS],?\s*-?\d{1,3}\.\d+[°\s]?[EW]\b)");
    output = std::regex_replace(output, coords, "[COORD_HIDDEN]");

    // ========== 17. Username / handle ==========
    std::regex username(R"(@[A-Za-z0-9_]+)");
    output = std::regex_replace(output, username, "[USERNAME_HIDDEN]");

    // ========== 18. Password hints / plain passwords ==========
    std::regex password_hint(R"(\b(?:password|passwd|pwd)[:\s]*[^\s]{4,}\b)", std::regex_constants::icase);
    output = std::regex_replace(output, password_hint, "[PASSWORD_HIDDEN]");

    return output;
}