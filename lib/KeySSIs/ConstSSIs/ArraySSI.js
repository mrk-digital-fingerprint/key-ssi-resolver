function ArraySSI(identifier) {
    const SSITypes = require("../SSITypes");
    const KeySSIMixin = require("../KeySSIMixin");
    const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

    KeySSIMixin(this);
    const self = this;

    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.getName = () => {
        return SSITypes.ARRAY_SSI;
    };

    self.initialize = (dlDomain, arr, vn, hint) => {
        const key = cryptoRegistry.getKeyDerivationFunction(self)(arr.join(''), 1000);
        self.load(SSITypes.ARRAY_SSI, dlDomain, cryptoRegistry.getEncodingFunction(self)(key), "", vn, hint);
    };

    self.derive = () => {
        const ConstSSI = require("./ConstSSI");
        const constSSI = ConstSSI.createConstSSI();
        constSSI.load(SSITypes.CONST_SSI, self.getDLDomain(), self.getSpecificString(), self.getControl(), self.getVn(), self.getHint());
        return constSSI;
    };

    self.getEncryptionKey = () => {
        return self.derive().getEncryptionKey();
    };
}

function createArraySSI(identifier) {
    return new ArraySSI(identifier);
}

module.exports = {
    createArraySSI
};