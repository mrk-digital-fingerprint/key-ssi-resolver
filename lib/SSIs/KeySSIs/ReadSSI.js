const crypto = require("pskcrypto");
const KeySSI = require("./KeySSI");
const PublicSSI = require("./PublicSSI");
const SSITypes = require("../SSITypes");

function ReadSSI(identifier) {
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.load(identifier);
    }

    this.derive = () => {
        const publicSSI = new PublicSSI();
        publicSSI.load(SSITypes.PUBLIC_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return publicSSI;
    };
}

module.exports = ReadSSI;