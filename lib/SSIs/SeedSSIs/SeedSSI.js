const crypto = require("pskcrypto");
const KeySSI = require("../KeySSIs/KeySSI");
const ZaSSI = require("../KeySSIs/ZaSSI");
const SSITypes = require("../SSITypes");

function SeedSSI(identifier) {
    Object.assign(this, KeySSI);
    this.subtype = SSITypes.SEED_SSI;

    if (typeof identifier !== "undefined") {
        this.load(identifier);
    }
    this.derive = () => {
        const zaSSI = new ZaSSI();
        zaSSI.initialize(SSITypes.ZERO_ACCESS_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return zaSSI;
    };
}

module.exports = SeedSSI;