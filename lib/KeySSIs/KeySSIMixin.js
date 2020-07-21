
const KeySSIMixin = {
    prefix: "ssi",
    subtype: undefined,
    dlDomain: undefined,
    subtypeSpecificString: undefined,
    control: undefined,
    vn: "v0",
    hint: undefined,
    cryptoRegistry: require("./CryptoAlgorithmsRegistry"),

    autoLoad: function (identifier) {
        let segments = identifier.split(":");
        segments.shift();
        this.subtype = segments.shift();
        this.dlDomain = segments.shift();
        this.control = segments.shift();
        let vn = segments.shift();
        if (vn !== '') {
            this.vn = vn;
        }
        this.subtypeSpecificString = this.cryptoRegistry.getDecodingFunction(this.vn)(segments.shift());
        let hint = segments.shift();
        if (hint !== '') {
            this.hint = hint;
        }
    },

    load: function (subtype, dlDomain, subtypeSpecificString, control, vn, hint) {
        this.subtype = subtype;
        this.dlDomain = dlDomain;
        this.subtypeSpecificString = subtypeSpecificString;
        this.control = control;
        this.vn = vn || "v0";
        this.hint = hint;
    },

    /**
     *
     * @param ssiType - string
     * @param callback - function
     */
    getRelatedType: function (ssiType, callback) {
        console.log("Get related type called ========================")
        const KeySSIFactory = require("./KeySSIFactory");
        KeySSIFactory.getRelatedType(this, ssiType, callback);
    },

    getEncryptionKey: function () {
        return this.subtypeSpecificString;
    },

    getName: function () {
        return this.subtype;
    },

    getIdentifier: function () {
        const key = this.cryptoRegistry.getEncodingFunction(this.vn)(this.subtypeSpecificString);
        let id = `${this.prefix}:${this.subtype}:${this.dlDomain}:${key}:${this.control}:${this.vn}`;
        if (typeof this.hint !== "undefined") {
            id += ":" + this.hint;
        }

        return id;
    }
}

module.exports = KeySSIMixin;