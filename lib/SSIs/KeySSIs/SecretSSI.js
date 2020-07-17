const crypto = require("pskcrypto");
const KeySSI = require("./KeySSI");
const AnchorSSI = require("./AnchorSSI");
const SSITypes = require("../SSITypes");

function SecretSSI(identifier) {
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.derive = () => {
        const anchorSSI = new AnchorSSI();
        anchorSSI.load(SSITypes.ANCHOR_SSI, this.dlDomain, crypto.pskHash(this.subtypeSpecificString), this.control, this.vn, this.hint);
        return anchorSSI;
    };
}

module.exports = SecretSSI;