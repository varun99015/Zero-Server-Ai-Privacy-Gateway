zero-server-ai-gateway/
│
├── core/                         # C++ → WebAssembly Engine
│   ├── src/
│   │   ├── sanitizer.cpp
│   │   ├── sanitizer.h
│   │   └── main.cpp
│   │
│   ├── build/
│   ├── CMakeLists.txt
│   └── build.sh
│
├── extension/                    # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   │
│   ├── background/
│   │   └── service-worker.js
│   │
│   ├── content/
│   │   └── content.js
│   │
│   ├── worker/
│   │   └── sanitizer.worker.js
│   │
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   │
│   └── assets/
│
├── security/                     # Crypto + Local Vault
│   ├── attestation.js
│   └── vault.js
│
├── shared/                       # Shared Interfaces
│   └── config.js
│
├── tests/                        # Basic Testing
│   └── test-plan.md
│
├── docs/                         # Documentation
│   └── architecture.md
│
├── README.md
└── package.json
