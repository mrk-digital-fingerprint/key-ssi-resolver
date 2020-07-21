const KeySSIMixin = require("../KeySSIMixin");
const SZaSSI = require("./SZaSSI");
const SSITypes = require("../SSITypes");

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
        const sZaSSI = SZaSSI.createSZaSSI();
        const subtypeKey = this.cryptoRegistry.getHashFunction(this.vn)(this.subtypeSpecificString);
        sZaSSI.load(SSITypes.SZERO_ACCESS_SSI, this.dlDomain, subtypeKey, this.control, this.vn, this.hint);
        return sZaSSI;
    };
}

function createConstSSI(identifier) {
    return new ConstSSI(identifier);
}

module.exports = {
    createConstSSI
};