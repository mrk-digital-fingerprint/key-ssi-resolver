const KeySSIMixin = require("../KeySSIMixin");
const CZaSSI = require("./CZaSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

function ConstSSI(identifier){
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, subtypeSpecificString, vn, hint) => {
        this.dlDomain = dlDomain;
        this.subtypeSpecificString = subtypeSpecificString;
        this.control = '';
        this.vn = vn || 'v0';
        this.hint = hint;
    };

    this.derive = () => {
        const cZaSSI = CZaSSI.createCZaSSI();
        const subtypeKey = cryptoRegistry.getHashFunction(this)(this.subtypeSpecificString);
        cZaSSI.load(SSITypes.CONSTANT_ZERO_ACCESS_SSI, this.dlDomain, subtypeKey, this.control, this.vn, this.hint);
        return cZaSSI;
    };
}

function createConstSSI(identifier) {
    return new ConstSSI(identifier);
}

module.exports = {
    createConstSSI
};