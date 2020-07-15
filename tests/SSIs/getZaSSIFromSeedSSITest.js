require("../../../../psknode/bundles/testsRuntime");
const crypto = require("pskcrypto");
const assert = require("double-check").assert;
const SeedSSI = require("../../lib/SSIs/SeedSSIs/SeedSSI");
const ZaSSI = require("../../lib/SSIs/KeySSIs/ZaSSI");

const seedSSI = new SeedSSI()
seedSSI.initialize("seed", "domain", "encKey", "control");
const seedSSIIdentifier = `ssi:seed:domain:${crypto.pskBase58Encode("encKey")}:control:v0`;
const zaSSIIdentifier = `ssi:za:domain:${crypto.pskBase58Encode(crypto.pskHash("encKey"))}:control:v0`;
const newZaSSI = new ZaSSI(zaSSIIdentifier);

assert.begin();
assert.true(seedSSIIdentifier === seedSSI.getIdentifier());
assert.true(zaSSIIdentifier === seedSSI.derive().getIdentifier());
assert.true(zaSSIIdentifier === newZaSSI.getIdentifier());
assert.true(seedSSI.derive().getEncryptionKey().toString() === newZaSSI.getEncryptionKey().toString());

assert.end();