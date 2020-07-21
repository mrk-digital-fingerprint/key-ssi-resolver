const KeySSIMixin = require("../KeySSIMixin");
const SZaSSI = require("./SZaSSI");
const SSITypes = require("../SSITypes");

function PasswordSSI(identifier){
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, context, password, vn, hint) => {
        this.subtype = SSITypes.PASSWORD_SSI;
        this.dlDomain = dlDomain;
        this.subtypeSpecificString = (context + password);
        this.control =
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

function createPasswordSSI(identifier) {
    return new PasswordSSI(identifier);
}

module.exports = {
    createPasswordSSI
};