require("../../../../psknode/bundles/testsRuntime");
const KeySSIFactory = require("../../lib/KeySSIs/KeySSIFactory");
const CryptoAlgorithmsRegistry = require("../../lib/KeySSIs/CryptoAlgorithmsRegistry");
const assert = require("double-check").assert;
const PasswordSSI = require("../../lib/KeySSIs/SeedSSIs/PasswordSSI");
const passwordSSI = PasswordSSI.createPasswordSSI();
passwordSSI.load("seed", "domain", "encKey", "control", "v0", "hint");
const subtypeSpecificString = CryptoAlgorithmsRegistry.getEncodingFunction(passwordSSI.vn)(CryptoAlgorithmsRegistry.getHashFunction(passwordSSI.vn)(passwordSSI.subtypeSpecificString))
const sZaSSIIdentifier = `ssi:sza:domain:${subtypeSpecificString}:control:v0:hint`;
assert.begin();
assert.true(sZaSSIIdentifier === passwordSSI.derive().getIdentifier());
assert.end();