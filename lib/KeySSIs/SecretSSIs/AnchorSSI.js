const KeySSIMixin = require("../KeySSIMixin");
const ReadSSI = require("./ReadSSI");
const SSITypes = require("../SSITypes");

function AnchorSSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.derive = () => {
        const readSSI = ReadSSI.createReadSSI();
        const subtypeKey = this.cryptoRegistry.getHashFunction(this.vn)(this.subtypeSpecificString);
        readSSI.load(SSITypes.READ_SSI, this.dlDomain, subtypeKey, this.control, this.vn, this.hint);
        return readSSI;
    };
}

function createAnchorSSI(identifier) {
    return new AnchorSSI(identifier);
}

module.exports = {
    createAnchorSSI
}