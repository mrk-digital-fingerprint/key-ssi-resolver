const KeySSIMixin = require("../KeySSIMixin");
const AnchorSSI = require("./AnchorSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

function SecretSSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.derive = () => {
        const anchorSSI = AnchorSSI.createAnchorSSI();
        const subtypeKey = cryptoRegistry.getHashFunction(this)(this.subtypeSpecificString)
        anchorSSI.load(SSITypes.ANCHOR_SSI, this.dlDomain, subtypeKey, this.control, this.vn, this.hint);
        return anchorSSI;
    };
}

function createSecretSSI (identifier){
    return new SecretSSI(identifier);
}
module.exports = {
    createSecretSSI
}