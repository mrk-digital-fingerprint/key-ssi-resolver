const cryptoRegistry = require("./CryptoAlgorithmsRegistry");
const pskCrypto = require("../../../pskcrypto");

const KeySSIMixin = {
    prefix: "ssi",
    subtype: undefined,
    dlDomain: undefined,
    subtypeSpecificString: undefined,
    control: undefined,
    vn: "v0",
    hint: undefined,

    autoLoad: function (identifier) {
        if(typeof identifier === "undefined"){
            return;
        }
        let segments = identifier.split(":");
        segments.shift();
        this.subtype = segments.shift();
        this.dlDomain = segments.shift();
        this.subtypeSpecificString = segments.shift();
        this.control = segments.shift();
        let vn = segments.shift();
        if (vn !== '') {
            this.vn = vn;
        }
        if (segments.length > 0) {
            this.hint = segments.join(":");
        }
        this.subtypeSpecificString = cryptoRegistry.getDecodingFunction(this)(this.subtypeSpecificString);
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
        const KeySSIFactory = require("./KeySSIFactory");
        KeySSIFactory.getRelatedType(this, ssiType, callback);
    },

    getAnchorId: function () {
        const keySSIFactory = require("./KeySSIFactory");
        return keySSIFactory.getAnchorType(this).getIdentifier();
    },

    getEncryptionKey: function () {
        return this.subtypeSpecificString;
    },

    getName: function () {
        return this.subtype;
    },

    getDLDomain: function () {
        return this.dlDomain;
    },

    getControl: function () {
        return this.control;
    },

    getHint: function () {
        return this.hint;
    },

    getVn: function () {
        return this.vn;
    },

    getDSURepresentationName: function () {
        const DSURepresentationNames = require("./DSURepresentationNames");
        return DSURepresentationNames[this.subtype];
    },

    getIdentifier: function (plain) {
        const key = cryptoRegistry.getEncodingFunction(this)(this.subtypeSpecificString);
        let id = `${this.prefix}:${this.subtype}:${this.dlDomain}:${key}:${this.control}:${this.vn}`;
        
        if (typeof this.hint !== "undefined") {
            id += ":" + this.hint;
        }

        return plain ? id : pskCrypto.pskBase58Encode(id);
    }
}

module.exports = KeySSIMixin;