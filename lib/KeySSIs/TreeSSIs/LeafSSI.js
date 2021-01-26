const base58 = require("bs58");

const KeySSIMixin = require("../KeySSIMixin");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");
const {EXPIRED_AT_KEY} = require("./treeSSIConstants")

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

    self.verify = (data, signature) => {
        return cryptoRegistry.getVerifyFunction(self)(data, self.getPubKeyBase58Decoded(), signature);
    };

    self.getExpiredAt = () => {
        const hintObject = self.getHintObject() || {};

        return hintObject[EXPIRED_AT_KEY]
    }

    self.getPubKeyBase58Decoded = (pubKey = self.getControlString()) => {
        return base58.decode(pubKey).toString()
    }
}

function createLeafSSI(identifier) {
    return new LeafSSI(identifier)
}

module.exports = {
    createLeafSSI
};