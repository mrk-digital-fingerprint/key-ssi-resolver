const KeySSIMixin = require("../KeySSIMixin");
const SSITypes = require("../SSITypes");

function CZaSSI(identifier) {
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

function createCZaSSI(identifier) {
    return new CZaSSI(identifier);
}

module.exports = {
    createCZaSSI
};