const KeySSIMixin = require("../KeySSIMixin");
const PublicSSI = require("./PublicSSI");
const SSITypes = require("../SSITypes");

function ReadSSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.load(identifier);
    }

    this.derive = () => {
        const publicSSI = PublicSSI.createPublicSSI();
        const subtypeKey = this.cryptoRegistry.getHashFunction(this.vn)(this.subtypeSpecificString);
        publicSSI.load(SSITypes.PUBLIC_SSI, this.dlDomain, subtypeKey, this.control, this.vn, this.hint);
        return publicSSI;
    };
}

function createReadSSI(identifier) {
    return new ReadSSI(identifier);
}

module.exports = {
    createReadSSI
};