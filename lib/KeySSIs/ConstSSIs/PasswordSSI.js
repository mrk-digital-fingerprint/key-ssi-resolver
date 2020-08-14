const KeySSIMixin = require("../KeySSIMixin");
const ConstSSI = require("./ConstSSI");
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
        const constSSI = ConstSSI.createConstSSI();
        const subtypeKey = this.cryptoRegistry.getKeyDerivationFunction(this.vn)(this.subtypeSpecificString, this.hint);
        constSSI.load(SSITypes.CONSTANT_ZERO_ACCESS_SSI, this.dlDomain, subtypeKey, this.control, this.vn, this.hint);
        return constSSI;
    };
}

function createPasswordSSI(identifier) {
    return new PasswordSSI(identifier);
}

module.exports = {
    createPasswordSSI
};