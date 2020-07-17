const crypto = require("pskcrypto");
const KeySSI = require("./KeySSI");
const ReadSSI = require("./ReadSSI");
const SSITypes = require("../SSITypes");

function AnchorSSI(identifier) {
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.derive = () => {
        const readSSI = new ReadSSI();
        readSSI.load(SSITypes.READ_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return readSSI;
    };
}

module.exports = AnchorSSI;