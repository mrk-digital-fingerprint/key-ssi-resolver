const crypto = require("pskcrypto");
const KeySSI = require("../KeySSIs/KeySSI");
const ZaSSI = require("../KeySSIs/ZaSSI");
const SSITypes = require("../SSITypes");

function PasswordSSI(identifier){
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, context, password, vn, hint) => {
        this.subtype = SSITypes.PASSWORD_SSI;
        this.dlDomain = dlDomain;
        this.subtypeSpecificString = crypto.deriveKey(context + password);
        this.control =
        this.vn = vn || 'v0';
        this.hint = hint;
    };

    this.derive = () => {
        const zaSSI = new ZaSSI();
        zaSSI.load(SSITypes.ZERO_ACCESS_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return zaSSI;
    };
}

module.exports = PasswordSSI;