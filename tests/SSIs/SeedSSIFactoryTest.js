require("../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;
const SSITypes = require("../../lib/SSIs/SSITypes");

const SeedSSI = require("../../lib/SSIs/SeedSSIs/SeedSSI");
const SReadSSI = require("../../lib/SSIs/SeedSSIs/SReadSSI");
const SZaSSI = require("../../lib/SSIs/SeedSSIs/SZaSSI");

const SeedSSIFactory = require("../../lib/SSIs/SeedSSIs/SeedSSIFactory");

SeedSSIFactory.prototype.registerFactory(SSITypes.SEED_SSI, 'v0', SSITypes.SREAD_SSI, (identifier) => {
    return new SeedSSI(identifier);
});

SeedSSIFactory.prototype.registerFactory(SSITypes.SREAD_SSI, 'v0', SSITypes.SZERO_ACCESS_SSI, (identifier) => {
    return new SReadSSI(identifier);
});

SeedSSIFactory.prototype.registerFactory(SSITypes.SZERO_ACCESS_SSI, 'v0', undefined, (identifier) => {
    return new SZaSSI(identifier);
});

const seedSSI = SeedSSIFactory.prototype.createKeySSI(SSITypes.SEED_SSI);
seedSSI.initialize("domain", undefined, undefined, "v0");

assert.callback("SeedSSIFactory get related type test", (callback) => {
    SeedSSIFactory.prototype.getRelatedType(seedSSI, SSITypes.SZERO_ACCESS_SSI, (err, sZaSSI) => {
        if (err) {
            throw err;
        }
        assert.true(sZaSSI instanceof SZaSSI);
        callback();
    });
}, 2000);