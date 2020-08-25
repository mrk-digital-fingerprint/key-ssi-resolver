const KeySSIMixin = require("../KeySSIMixin");
const ConstSSI = require("./ConstSSI");
const SSITypes = require("../SSITypes");

function PasswordSSI(identifier){
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, context, password, kdfOptions, vn, hint) => {
        this.subtype = SSITypes.PASSWORD_SSI;
        this.dlDomain = dlDomain;
        this.subtypeSpecificString = this.cryptoRegistry.getKeyDerivationFunction(this.vn)(context + password, kdfOptions);
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

function createPasswordSSI(identifier) {
    return new PasswordSSI(identifier);
}

module.exports = {
    createPasswordSSI
};