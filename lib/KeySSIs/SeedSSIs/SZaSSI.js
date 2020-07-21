const KeySSIMixin = require("../KeySSIMixin");
const SSITypes = require("../SSITypes");

function SZaSSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, hpk, vn, hint) => {
        this.subtype = SSITypes.SZERO_ACCESS_SSI;
        this.subtypeSpecificString = '';
        this.control = hpk;
        this.vn = vn || 'v0';
        this.hint = hint;
    };

    this.derive = () => {
        throw Error("Not implemented");
    };
}

function createSZaSSI(identifier) {
    return new SZaSSI(identifier);
}

module.exports = {
    createSZaSSI
};