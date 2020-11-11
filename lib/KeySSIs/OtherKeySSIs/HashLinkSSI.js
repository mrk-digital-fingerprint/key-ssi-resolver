const KeySSIMixin = require("../KeySSIMixin");
const SSITypes = require("../SSITypes");

function HashLinkSSI(identifier) {
    KeySSIMixin(this);
    const self = this;

    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.initialize = (dlDomain, hash, vn) => {
        try{
            if (typeof hash !== "string") {
                throw Error("Specific string is not string");
            }
        }catch (e) {
            console.log("Invalid hash for hashlink =====================", e);
        }
        self.load(SSITypes.HASH_LINK_SSI, dlDomain, hash, '', vn);
    };

    self.getHash = () => {
        const specificString = self.getSpecificString();
        if (typeof specificString !== "string") {
            console.trace("Specific string is not string", specificString.toString());
        }
        return specificString;
    };

    self.derive = () => {
        throw Error("Not implemented");
    };
}

function createHashLinkSSI(identifier) {
    return new HashLinkSSI(identifier);
}

module.exports = {
    createHashLinkSSI
};