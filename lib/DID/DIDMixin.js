'use strict';

const crypto = require("pskcrypto");
const CryptoAlgorithmsSchemeVersioning = require('./CryptoAlgorithmsSchemeVersioning');

const DIDMixin = {
    url: null,
    KEY_LENGTH: 32,
    options: null,
    dlDomain: null,
    key: null,
    favouriteEndpoint: null,
    version: null,
    hashAlgorithm: null,
    encryptionAlgorithm: null,
    signatureAlgorithm: null,

    /**
     * @param {string|object} url
     * @param {object|undefined} options
     * @param {string} options.version
     * @param {string} options.dlDomain
     * @param {string} options.favouriteEndpoint
     */
    initialize: function (url, options) {
        if (typeof url === 'object') {
            options = url;
            url = undefined;
        }

        this.url = url;
        this.options = options || {};
        this.dlDomain = this.options.dlDomain;
        this.key = this.options.key;
        this.favouriteEndpoint = this.options.favouriteEndpoint;
        this.version = this.options.version;
    },

    /**
     * Choose and set cryptography algorithms
     * based on DID version
     *
     * @throws Error
     */
    setupCryptoAlgorithmsScheme: function () {
        const algorithms = CryptoAlgorithmsSchemeVersioning[this.version];

        if (typeof algorithms !== 'object') {
            throw new Error(`Unable to find crypto algorithms scheme based on version: ${this.version}`);
        }

        this.setEncryptionAlgorithm(algorithms.encryption);
        this.setHashAlgorithm(algorithms.hash);
        this.setSignatureAlgorithm(algorithms.signature);
    },

    /**
     * @return {string}
     */
    getAnchorAlias: function () {
        throw new Error('Unimplemented');
    },

    /**
     * @return {string}
     */
    getDLDomain: function () {
        return this.dlDomain;
    },

    /**
     * @return {string}
     */
    getFavouriteEndpoint: function () {
        return this.favouriteEndpoint;
    },

    /**
     * @return {Buffer}
     */
    getKey: function () {
        return this.key;
    },

    /**
     * @return {string}
     */
    getKeyHash: function () {
        const key = this.getKey();
        let keyHash;

        if (key) {
            keyHash = crypto.pskHash(key, 'hex');
        }

        return keyHash;
    },

    /**
     * @return {string}
     */
    toUrl: function () {
        throw new Error('Unimplemented');
    },

    /**
     * @return {string}
     * @throws Error
     */
    getHashAlgorithm: function () {
        if (!this.hashAlgorithm) {
            this.setupCryptoAlgorithmsScheme();
        }
        return this.hashAlgorithm;
    },

    /**
     * @return {string}
     * @throws Error
     */
    getEncryptionAlgorithm: function () {
        if (!this.encryptionAlgorithm) {
            this.setupCryptoAlgorithmsScheme();
        }
        return this.encryptionAlgorithm;
    },

    /**
     * @return {string}
     * @throws Error
     */
    getSignatureAlgorithm: function () {
        if (!this.encryptionAlgorithm) {
            this.setupCryptoAlgorithmsScheme();
        }
        return this.signatureAlgorithm;
    },

    /**
     * @param {string} alg
     */
    setHashAlgorithm: function (alg) {
        this.hashAlgorithm = alg;
    },

    /**
     * @param {string} alg
     */
    setEncryptionAlgorithm: function (alg) {
        this.encryptionAlgorithm = alg;
    },

    /**
     * @param {string} alg
     */
    setSignatureAlgorithm: function (alg) {
        this.signatureAlgorithm = alg;
    }
}

module.exports = DIDMixin;