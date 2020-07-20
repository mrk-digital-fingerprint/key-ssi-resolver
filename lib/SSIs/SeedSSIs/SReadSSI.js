const crypto = require("pskcrypto");
const KeySSI = require("../KeySSIs/KeySSI");
const SZaSSI = require("./SZaSSI");
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
        const sZaSSI = new SZaSSI();
        const subtypeKey = '';
        const subtypeControl = crypto.pskHash(this.control);
        sZaSSI.load(SSITypes.SZERO_ACCESS_SSI, this.dlDomain, subtypeKey, subtypeControl, this.vn, this.hint);
        return sZaSSI;
    };
}

module.exports = SeedSSI;