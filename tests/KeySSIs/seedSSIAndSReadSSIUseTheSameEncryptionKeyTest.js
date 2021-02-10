require("../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;
const SeedSSI = require("../../lib/KeySSIs/SeedSSIs/SeedSSI");

assert.callback("SeedSSI and SReadSSI use the same encryption key test", (callback) => {
    callback()
    // const seedSSI = SeedSSI.createSeedSSI();
    // seedSSI.initialize("domain", undefined, undefined, "v0", "hint", (err) => {
    //     if (err) {
    //         throw err;
    //     }
    //     assert.true(seedSSI.getEncryptionKey().toString() === seedSSI.derive().getEncryptionKey().toString());
    //     callback();
    // });
});