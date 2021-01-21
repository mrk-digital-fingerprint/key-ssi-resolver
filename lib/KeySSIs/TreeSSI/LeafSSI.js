const KeySSIMixin = require("../KeySSIMixin");
const SZaSSI = require("./SZaSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

function LeafSSI(identifier) {
    KeySSIMixin(this);
    const self = this;

    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.initialize = (dlDomain, vn, hint) => {
        self.load(SSITypes.LEAF_SSI, dlDomain, "", undefined, vn, hint);
    };

    self.getVerificationKey = (data, signature) => {
        return cryptoRegistry.getVerifyFunction(self)(data, self.getControl(), signature);
    };
}

function createLeafSSI(identifier) {
    return new LeafSSI(identifier)
}

module.exports = {
    createLeafSSI
};