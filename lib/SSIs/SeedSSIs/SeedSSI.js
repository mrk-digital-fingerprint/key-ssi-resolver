const crypto = require("pskcrypto");
const KeySSI = require("../KeySSIs/KeySSI");
const ZaSSI = require("../KeySSIs/ZaSSI");
const SSITypes = require("../SSITypes");

function SeedSSI(identifier) {
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, vn, hint) => {
        this.dlDomain = dlDomain;
        this.vn = vn || "v0";
        this.hint = hint;
    };
    this.derive = () => {
        const zaSSI = new ZaSSI();
        zaSSI.load(SSITypes.ZERO_ACCESS_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return zaSSI;
    };
}

module.exports = SeedSSI;