require("../../../../psknode/bundles/testsRuntime");
const crypto = require("pskcrypto");
const assert = require("double-check").assert;
const PasswordSSI = require("../../lib/KeySSIs/SeedSSIs/PasswordSSI");

const passwordSSI = new PasswordSSI()
passwordSSI.initialize("seed", "domain", "encKey", "control");
const zaSSIIdentifier = `ssi:za:domain:${crypto.pskBase58Encode(crypto.pskHash(passwordSSI.getEncryptionKey()))}:control:v0`;

assert.begin();
assert.true(zaSSIIdentifier === passwordSSI.derive().getIdentifier());
assert.end();