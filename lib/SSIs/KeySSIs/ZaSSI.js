const KeySSI = require("./KeySSI");
function ZaSSI(identifier) {
    Object.assign(this, KeySSI);
    if (typeof identifier !== "undefined") {
        this.load(identifier);
    }

    this.derive = () => {
        throw Error("Not implemented");
    };
}

module.exports = ZaSSI;