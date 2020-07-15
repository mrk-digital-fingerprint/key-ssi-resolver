const crypto = require("pskcrypto");
const KeySSI = require("../KeySSIs/KeySSI");
const ZaSSI = require("../KeySSIs/ZaSSI");
const SSITypes = require("../SSITypes");

function PasswordSSI(identifier){
    Object.assign(this, KeySSI);
    this.subtype = SSITypes.PASSWORD_SSI;
    if (typeof identifier !== "undefined") {
        this.load();
    }

    this.initialize = (subtype, dlDomain, password, control, vn, hint) => {
        this.subtype = subtype;
        this.dlDomain = dlDomain;
        this.subtypeSpecificString = crypto.deriveKey(password);
        this.control = control;
        this.vn = vn || 'v0';
        this.hint = hint;
    };

    this.derive = () => {
        const zaSSI = new ZaSSI();
        zaSSI.initialize(SSITypes.ZERO_ACCESS_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return zaSSI;
    };
}

module.exports = PasswordSSI;