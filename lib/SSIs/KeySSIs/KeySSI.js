const crypto = require("pskcrypto");
const KeySSIFactoryRegistry = require("./KeySSIFactoryRegistry");
const KeySSI = {
    prefix: "ssi",
    subtype: undefined,
    dlDomain: undefined,
    subtypeSpecificString: undefined,
    control: undefined,
    vn: "v0",
    hint: undefined,
    keySSIFactoryRegistry: new KeySSIFactoryRegistry(),

    autoLoad: function (identifier) {
        let segments = identifier.split(":");
        segments.shift();
        this.subtype = segments.shift();
        this.dlDomain = segments.shift();
        this.subtypeSpecificString = crypto.pskBase58Decode(segments.shift());
        this.control = segments.shift();
        let vn = segments.shift();
        if (vn !== '') {
            this.vn = vn;
        }
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
        this.keySSIFactoryRegistry.getRelatedType(this, ssiType, callback);
    },

    getEncryptionKey: function () {
        return this.subtypeSpecificString;
    },

    getName: function () {
        return this.subtype;
    },

    getIdentifier: function () {
        let id = `${this.prefix}:${this.subtype}:${this.dlDomain}:${crypto.pskBase58Encode(this.subtypeSpecificString)}:${this.control}:${this.vn}`;
        if (typeof this.hint !== "undefined") {
            id += ":" + this.hint;
        }

        return id;
    }
}

module.exports = KeySSI;