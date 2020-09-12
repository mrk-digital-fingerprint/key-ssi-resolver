const KeySSIMixin = require("../KeySSIMixin");
const SSITypes = require("../SSITypes");

function HashLinkSSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, hash, vn) => {
        this.subtype = SSITypes.HASH_LINK_SSI;
        this.subtypeSpecificString = hash;
        this.control = '';
        this.vn = vn || 'v0';
    };

    this.getHash = () => {
        return this.subtypeSpecificString;
    };

    this.derive = () => {
        throw Error("Not implemented");
    };
}

function createHashLinkSSI(identifier) {
    return new HashLinkSSI(identifier);
}

module.exports = {
    createHashLinkSSI
};