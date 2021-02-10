const {createSeedSSI: createSeedSSIV0} = require("./v0/SeedSSI");
const {createSeedSSI: createSeedSSIV1} = require("./v1/SeedSSI");
const {V0, V1} = require("../KeySSIConstants")

function createSeedSSI(identifier, version = V0) {
    switch (version) {
        case V0:
            return createSeedSSIV0(identifier);
        case V1:
            return createSeedSSIV1(identifier);
        default:
            return createSeedSSIV0(identifier);
    }
}

module.exports = {
    createSeedSSI
};