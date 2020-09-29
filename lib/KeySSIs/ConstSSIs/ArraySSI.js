function ArraySSI(identifier) {
    const SSITypes = require("../SSITypes");
    const KeySSIMixin = require("../KeySSIMixin");
    const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

    KeySSIMixin(this);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.getName = () => {
        return SSITypes.ARRAY_SSI;
    };

    this.initialize = (dlDomain, arr,   vn, hint) => {
        this.load(SSITypes.ARRAY_SSI, dlDomain, cryptoRegistry.getKeyDerivationFunction(this)(arr.join(''), 1000), "", vn, hint);
    };

    this.derive = () => {
        const ConstSSI = require("./ConstSSI");
        const constSSI = ConstSSI.createConstSSI();
        constSSI.load(SSITypes.CONST_SSI, this.getDLDomain(), getEncryptionKey(), this.getControl(), this.getVn(), this.getHint());
        return constSSI;
    };

    let getEncryptionKey = this.getEncryptionKey;
    this.getEncryptionKey = () => {
        return this.derive().getEncryptionKey();
    };
}

function createArraySSI(identifier) {
    return new ArraySSI(identifier);
}

module.exports = {
    createArraySSI
};