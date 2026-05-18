// utils/benchmark.js

const testDataset = [
    {
        "id": 1,
        "text": "The new processor has 2 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 2,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 3,
        "text": "International dial: +91 987 654 4210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 4,
        "text": "The solution to the equation is x = 5 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 5,
        "text": "The SSN on file is 123-64-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 6,
        "text": "My personal email is user.7@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 7,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 8,
        "text": "Server IP is 192.168.1.9 and MAC is 00:1A:2B:3C:4D:9A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 9,
        "text": "International dial: +91 987 654 1210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 10,
        "text": "Routing number: 011000012 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 11,
        "text": "The new processor has 3 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 12,
        "text": "The new processor has 4 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 13,
        "text": "Charge it to 4111 1111 1111 1511.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 14,
        "text": "Charge it to 4111 1111 1111 1611.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 15,
        "text": ".container { width: 700px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 16,
        "text": "Charge it to 4111 1111 1111 1811.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 17,
        "text": "Routing number: 011000019 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 18,
        "text": "Routing number: 011000011 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 19,
        "text": "International dial: +91 987 654 2210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 20,
        "text": "Patient was born 1990-05-3 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 21,
        "text": "My personal email is user.4@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 22,
        "text": "The new processor has 5 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 23,
        "text": ".container { width: 600px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 24,
        "text": "My personal email is user.7@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 25,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 26,
        "text": "Test card 4111 1111 1111 1119 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 27,
        "text": "The solution to the equation is x = 1 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 28,
        "text": "Ship to 200 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 29,
        "text": "International dial: +91 987 654 3210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 30,
        "text": "Test card 4111 1111 1111 1114 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 31,
        "text": "const API_URL = 'https://api.example.com/v1/users/5';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 32,
        "text": "Call me immediately at (555) 123-6456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 33,
        "text": "Charge it to 4111 1111 1111 1711.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 34,
        "text": "Ship to 800 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 35,
        "text": ".container { width: 900px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 36,
        "text": "Server IP is 192.168.1.1 and MAC is 00:1A:2B:3C:4D:1A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 37,
        "text": "Call me immediately at (555) 123-2456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 38,
        "text": "Test card 4111 1111 1111 1113 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 39,
        "text": "The new processor has 4 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 40,
        "text": "const API_URL = 'https://api.example.com/v1/users/5';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 41,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 42,
        "text": "Contact the admin at admin_7@example.com for access.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 43,
        "text": "Routing number: 011000018 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 44,
        "text": "Charge it to 4111 1111 1111 1911.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 45,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 46,
        "text": ".container { width: 200px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 47,
        "text": "Routing number: 011000013 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 48,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 49,
        "text": "Patient was born 1990-05-5 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 50,
        "text": "The solution to the equation is x = 6 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 51,
        "text": "International dial: +91 987 654 7210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 52,
        "text": "Order ID: #8998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 53,
        "text": "International dial: +91 987 654 9210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 54,
        "text": ".container { width: 100px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 55,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 56,
        "text": "for(let i=0; i<3; i++) { console.log(i); }",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 57,
        "text": "International dial: +91 987 654 4210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 58,
        "text": "Server IP is 192.168.1.5 and MAC is 00:1A:2B:3C:4D:5A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 59,
        "text": ".container { width: 600px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 60,
        "text": "Charge it to 4111 1111 1111 1711.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 61,
        "text": "Charge it to 4111 1111 1111 1811.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 62,
        "text": ".container { width: 900px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 63,
        "text": "The solution to the equation is x = 1 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 64,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 65,
        "text": "Test card 4111 1111 1111 1113 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 66,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 67,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 68,
        "text": "My personal email is user.6@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 69,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 70,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 71,
        "text": "for(let i=0; i<9; i++) { console.log(i); }",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 72,
        "text": "Call me immediately at (555) 123-1456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 73,
        "text": "Call me immediately at (555) 123-2456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 74,
        "text": "The SSN on file is 123-34-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 75,
        "text": "Test card 4111 1111 1111 1114 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 76,
        "text": ".container { width: 500px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 77,
        "text": "Server IP is 192.168.1.6 and MAC is 00:1A:2B:3C:4D:6A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 78,
        "text": "International dial: +91 987 654 7210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 79,
        "text": ".container { width: 800px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 80,
        "text": "Ship to 900 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 81,
        "text": "The new processor has 1 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 82,
        "text": ".container { width: 200px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 83,
        "text": "Server IP is 192.168.1.3 and MAC is 00:1A:2B:3C:4D:3A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 84,
        "text": "Ship to 400 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 85,
        "text": "Ship to 500 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 86,
        "text": "The SSN on file is 123-64-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 87,
        "text": "Ship to 700 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 88,
        "text": "My personal email is user.8@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 89,
        "text": "International dial: +91 987 654 9210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 90,
        "text": "Call me immediately at (555) 123-1456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 91,
        "text": "International dial: +91 987 654 2210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 92,
        "text": ".container { width: 300px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 93,
        "text": "Test card 4111 1111 1111 1114 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 94,
        "text": "The new processor has 5 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 95,
        "text": "The SSN on file is 123-64-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 96,
        "text": "The SSN on file is 123-74-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 97,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 98,
        "text": "Routing number: 011000019 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 99,
        "text": "Ship to 100 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 100,
        "text": "The SSN on file is 123-24-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 101,
        "text": "Order ID: #3998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 102,
        "text": "Charge it to 4111 1111 1111 1411.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 103,
        "text": "International dial: +91 987 654 5210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 104,
        "text": "The new processor has 6 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 105,
        "text": "Ship to 700 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 106,
        "text": "Charge it to 4111 1111 1111 1811.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 107,
        "text": ".container { width: 900px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 108,
        "text": "The SSN on file is 123-14-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 109,
        "text": "for(let i=0; i<2; i++) { console.log(i); }",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 110,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 111,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 112,
        "text": "Ship to 500 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 113,
        "text": "Call me immediately at (555) 123-6456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 114,
        "text": "My personal email is user.7@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 115,
        "text": "Contact the admin at admin_8@example.com for access.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 116,
        "text": "Routing number: 011000019 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 117,
        "text": "International dial: +91 987 654 1210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 118,
        "text": "The new processor has 2 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 119,
        "text": "Routing number: 011000013 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 120,
        "text": ".container { width: 400px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 121,
        "text": "My personal email is user.5@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 122,
        "text": "The SSN on file is 123-64-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 123,
        "text": "Patient was born 1990-05-7 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 124,
        "text": ".container { width: 800px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 125,
        "text": "The new processor has 9 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 126,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 127,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 128,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 129,
        "text": "Charge it to 4111 1111 1111 1411.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 130,
        "text": "The solution to the equation is x = 5 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 131,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 132,
        "text": "Charge it to 4111 1111 1111 1711.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 133,
        "text": "Test card 4111 1111 1111 1118 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 134,
        "text": "The solution to the equation is x = 9 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 135,
        "text": ".container { width: 100px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 136,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 137,
        "text": "Order ID: #3998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 138,
        "text": ".container { width: 400px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 139,
        "text": "Server IP is 192.168.1.5 and MAC is 00:1A:2B:3C:4D:5A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 140,
        "text": "Server IP is 192.168.1.6 and MAC is 00:1A:2B:3C:4D:6A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 141,
        "text": "The SSN on file is 123-74-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 142,
        "text": "Order ID: #8998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 143,
        "text": "for(let i=0; i<9; i++) { console.log(i); }",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 144,
        "text": "Patient was born 1990-05-1 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 145,
        "text": "Patient was born 1990-05-2 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 146,
        "text": "Ship to 300 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 147,
        "text": "Call me immediately at (555) 123-4456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 148,
        "text": "International dial: +91 987 654 5210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 149,
        "text": ".container { width: 600px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 150,
        "text": "const API_URL = 'https://api.example.com/v1/users/7';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 151,
        "text": "Patient was born 1990-05-8 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 152,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 153,
        "text": "The SSN on file is 123-14-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 154,
        "text": "Server IP is 192.168.1.2 and MAC is 00:1A:2B:3C:4D:2A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 155,
        "text": "Patient was born 1990-05-3 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 156,
        "text": "The SSN on file is 123-44-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 157,
        "text": "Call me immediately at (555) 123-5456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 158,
        "text": "Server IP is 192.168.1.6 and MAC is 00:1A:2B:3C:4D:6A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 159,
        "text": "Patient was born 1990-05-7 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 160,
        "text": "const API_URL = 'https://api.example.com/v1/users/8';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 161,
        "text": "Patient was born 1990-05-9 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 162,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 163,
        "text": "Ship to 200 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 164,
        "text": "Test card 4111 1111 1111 1113 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 165,
        "text": "Call me immediately at (555) 123-4456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 166,
        "text": "The SSN on file is 123-54-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 167,
        "text": "Call me immediately at (555) 123-6456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 168,
        "text": "Ship to 700 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 169,
        "text": "const API_URL = 'https://api.example.com/v1/users/8';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 170,
        "text": ".container { width: 900px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 171,
        "text": "Call me immediately at (555) 123-1456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 172,
        "text": "Charge it to 4111 1111 1111 1211.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 173,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 174,
        "text": "const API_URL = 'https://api.example.com/v1/users/4';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 175,
        "text": "My personal email is user.5@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 176,
        "text": "Ship to 600 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 177,
        "text": ".container { width: 700px; margin: 0 auto; }",
        "expected_pii": false,
        "category": "CSS"
    },
    {
        "id": 178,
        "text": "for(let i=0; i<8; i++) { console.log(i); }",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 179,
        "text": "const API_URL = 'https://api.example.com/v1/users/9';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 180,
        "text": "The solution to the equation is x = 1 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 181,
        "text": "Charge it to 4111 1111 1111 1211.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 182,
        "text": "Call me immediately at (555) 123-3456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 183,
        "text": "Patient was born 1990-05-4 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 184,
        "text": "Routing number: 011000015 and account: 123456789.",
        "expected_pii": true,
        "category": "Bank"
    },
    {
        "id": 185,
        "text": "Ship to 600 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 186,
        "text": "Call me immediately at (555) 123-7456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 187,
        "text": "International dial: +91 987 654 8210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 188,
        "text": "My personal email is user.9@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 189,
        "text": "Contact the admin at admin_1@example.com for access.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 190,
        "text": "Charge it to 4111 1111 1111 1211.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 191,
        "text": "Server IP is 192.168.1.3 and MAC is 00:1A:2B:3C:4D:3A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 192,
        "text": "Order ID: #4998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 193,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 194,
        "text": "Call me immediately at (555) 123-6456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 195,
        "text": "Contact the admin at admin_7@example.com for access.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 196,
        "text": "Patient was born 1990-05-8 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 197,
        "text": "Server IP is 192.168.1.9 and MAC is 00:1A:2B:3C:4D:9A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 198,
        "text": "Patient was born 1990-05-1 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 199,
        "text": "The new processor has 2 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 200,
        "text": "Order ID: #3998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 201,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 202,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 203,
        "text": "The SSN on file is 123-64-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 204,
        "text": "Patient was born 1990-05-7 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 205,
        "text": "Can you summarize the plot of this book for me?",
        "expected_pii": false,
        "category": "Normal Text"
    },
    {
        "id": 206,
        "text": "International dial: +91 987 654 9210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 207,
        "text": "Contact the admin at admin_1@example.com for access.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 208,
        "text": "Ship to 200 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 209,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 210,
        "text": "Test card 4111 1111 1111 1114 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 211,
        "text": "Server IP is 192.168.1.5 and MAC is 00:1A:2B:3C:4D:5A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 212,
        "text": "The SSN on file is 123-64-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 213,
        "text": "Ship to 700 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 214,
        "text": "Order ID: #8998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 215,
        "text": "The new processor has 9 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 216,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 217,
        "text": "Ship to 200 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 218,
        "text": "The SSN on file is 123-34-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 219,
        "text": "Test card 4111 1111 1111 1114 should fail.",
        "expected_pii": false,
        "category": "Edge Case - Luhn Fail"
    },
    {
        "id": 220,
        "text": "const API_URL = 'https://api.example.com/v1/users/5';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 221,
        "text": "Patient was born 1990-05-6 and is 34 years old.",
        "expected_pii": true,
        "category": "DOB & Age"
    },
    {
        "id": 222,
        "text": "The SSN on file is 123-74-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 223,
        "text": "Server IP is 192.168.1.8 and MAC is 00:1A:2B:3C:4D:8A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 224,
        "text": "Ship to 900 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 225,
        "text": "The SSN on file is 123-14-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 226,
        "text": "International dial: +91 987 654 2210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 227,
        "text": "The new processor has 3 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 228,
        "text": "Ship to 400 Tech Park Avenue, San Jose, CA 95131.",
        "expected_pii": true,
        "category": "Address"
    },
    {
        "id": 229,
        "text": "Charge it to 4111 1111 1111 1511.",
        "expected_pii": true,
        "category": "Credit Card"
    },
    {
        "id": 230,
        "text": "const API_URL = 'https://api.example.com/v1/users/6';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 231,
        "text": "Order ID: #7998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 232,
        "text": "Server IP is 192.168.1.8 and MAC is 00:1A:2B:3C:4D:8A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 233,
        "text": "Server IP is 192.168.1.9 and MAC is 00:1A:2B:3C:4D:9A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 234,
        "text": "The solution to the equation is x = 1 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 235,
        "text": "The SSN on file is 123-24-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 236,
        "text": "Order ID: #3998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 237,
        "text": "My personal email is user.4@gmail.com, hit me up.",
        "expected_pii": true,
        "category": "Email"
    },
    {
        "id": 238,
        "text": "Server IP is 192.168.1.5 and MAC is 00:1A:2B:3C:4D:5A.",
        "expected_pii": true,
        "category": "IP & MAC"
    },
    {
        "id": 239,
        "text": "What is the capital of France?",
        "expected_pii": false,
        "category": "General Query"
    },
    {
        "id": 240,
        "text": "Order ID: #7998273645 - Status: Shipped.",
        "expected_pii": false,
        "category": "Edge Case - Numbers"
    },
    {
        "id": 241,
        "text": "The solution to the equation is x = 8 * 4.2",
        "expected_pii": false,
        "category": "Math"
    },
    {
        "id": 242,
        "text": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50));",
        "expected_pii": false,
        "category": "Database Schema"
    },
    {
        "id": 243,
        "text": "The SSN on file is 123-14-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 244,
        "text": "const API_URL = 'https://api.example.com/v1/users/2';",
        "expected_pii": false,
        "category": "Code"
    },
    {
        "id": 245,
        "text": "Call me immediately at (555) 123-3456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 246,
        "text": "The SSN on file is 123-44-6789.",
        "expected_pii": true,
        "category": "SSN"
    },
    {
        "id": 247,
        "text": "Call me immediately at (555) 123-5456.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 248,
        "text": "The new processor has 6 cores and runs at 4.5GHz.",
        "expected_pii": false,
        "category": "Hardware Specs"
    },
    {
        "id": 249,
        "text": "International dial: +91 987 654 7210.",
        "expected_pii": true,
        "category": "Phone"
    },
    {
        "id": 250,
        "text": "International dial: +91 987 654 8210.",
        "expected_pii": true,
        "category": "Phone"
    }
];

async function runMetricsBenchmark() {
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;
    let totalLatencyMs = 0;

    console.log("🚀 Starting Zero-Server Benchmark...");

    // Ensure the engine is loaded before running
    if (!engineInstance) {
        console.error("❌ Wasm engineInstance is not loaded yet!");
        return;
    }

    for (const item of testDataset) {
        const start = performance.now();

        // Call the C++ Wasm engine
        const scrubbedText = engineInstance.ccall(
            'process',
            'string',
            ['string'],
            [item.text]
        );

        const end = performance.now();
        totalLatencyMs += (end - start);

        const didSanitize = scrubbedText !== item.text;

        if (item.expected_pii === true && didSanitize) {
            truePositives++;
        } else if (item.expected_pii === true && !didSanitize) {
            falseNegatives++;
            console.warn(`❌ Missed PII in: ${item.category} | Text: ${item.text}`);
        } else if (item.expected_pii === false && !didSanitize) {
            trueNegatives++;
        } else if (item.expected_pii === false && didSanitize) {
            falsePositives++;
            console.warn(`⚠️ False Positive on: ${item.category} | Text: ${item.text}`);
        }
    }

    const avgLatency = (totalLatencyMs / testDataset.length).toFixed(3);
    const accuracy = (((truePositives + trueNegatives) / testDataset.length) * 100).toFixed(1);

    console.log(`\n📊 --- BENCHMARK RESULTS ---`);
    console.log(`⏱️ Average Overhead: ${avgLatency} ms per prompt`);
    console.log(`🎯 Overall Accuracy: ${accuracy}%`);
    console.log(`\n🧩 Confusion Matrix Data:`);
    console.log(`- True Positives (TP): ${truePositives}`);
    console.log(`- True Negatives (TN): ${trueNegatives}`);
    console.log(`- False Positives (FP): ${falsePositives}`);
    console.log(`- False Negatives (FN): ${falseNegatives}`);
}