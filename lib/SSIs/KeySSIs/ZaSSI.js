const KeySSI = require("./KeySSI");
function ZaSSI(identifier) {
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.derive = () => {
        throw Error("Not implemented");
    };
}

module.exports = ZaSSI;