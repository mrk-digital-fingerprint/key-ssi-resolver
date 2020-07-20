const crypto = require("pskcrypto");
const KeySSI = require("../KeySSIs/KeySSI");
const SZaSSI = require("./SZaSSI");
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
        const sZaSSI = new SZaSSI();
        const subtypeKey = crypto.pskHash(this.subtypeSpecificString);
        sZaSSI.load(SSITypes.SZERO_ACCESS_SSI, this.dlDomain, subtypeKey, this.control, this.vn, this.hint);
        return sZaSSI;
    };
}

module.exports = PasswordSSI;