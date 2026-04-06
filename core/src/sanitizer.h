#ifndef SANITIZER_H
#define SANITIZER_H

#include <string>
#include <vector>

class Sanitizer {
public:
    // Main entry point: redacts all known PII from input text
    std::string process(const std::string& input);

private:
    // Helper: Luhn algorithm validation for credit card numbers
    bool luhnCheck(const std::string& cardNumber);

    // Helper: check if a string is a plausible credit card number (digits only)
    bool isCreditCardNumber(const std::string& s);
};

#endif