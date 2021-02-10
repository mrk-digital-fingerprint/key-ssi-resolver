const {createSReadSSI: createSReadSSIV0} = require("./v0/SReadSSI");
const {createSReadSSI: createSReadSSIV1} = require("./v1/SReadSSII");
const {V0, V1} = require("../KeySSIConstants")

function createSReadSSI(identifier, version = V0) {
    switch (version) {
        case V0:
            return createSReadSSIV0(identifier);
        case V1:
            return createSReadSSIV1(identifier);
        default:
            return createSReadSSIV0(identifier);
    }
}

module.exports = {
    createSReadSSI
};
