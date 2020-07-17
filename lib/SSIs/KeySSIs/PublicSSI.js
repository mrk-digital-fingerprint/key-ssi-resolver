const crypto = require("pskcrypto");
const KeySSI = require("./KeySSI");
const ZaSSI = require("./ZaSSI");
const SSITypes = require("../SSITypes");

function PublicSSI(identifier) {
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.load(identifier);
    }

    this.derive = () => {
        const zaSSI = new ZaSSI();
        zaSSI.initialize(SSITypes.ZERO_ACCESS_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return zaSSI;
    };
}

module.exports = PublicSSI;