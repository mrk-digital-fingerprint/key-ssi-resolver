const KeySSIMixin = require("../KeySSIMixin");
const ConstSSI = require("./ConstSSI");
const SSITypes = require("../SSITypes");

function ArraySSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, arr, kdfOptions, vn, hint) => {
        this.subtype = SSITypes.ARRAY_SSI;
        this.dlDomain = dlDomain;
        this.subtypeSpecificString = this.cryptoRegistry.getKeyDerivationFunction(this.vn)(arr.join(''), kdfOptions);
        this.control = '';
        this.vn = vn || 'v0';
        this.hint = hint;
    };

    this.derive = () => {
        const constSSI = ConstSSI.createConstSSI();
        constSSI.load(SSITypes.CONST_SSI, this.dlDomain, this.subtypeSpecificString, this.control, this.vn, this.hint);
        return constSSI;
    };

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