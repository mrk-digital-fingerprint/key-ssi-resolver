'use strict';

const crypto = require("pskcrypto");
const CryptoAlgorithmsSchemeVersioning = require('./CryptoAlgorithmsSchemeVersioning');

/**
 * @param {string|object} url
 * @param {object|undefined} options
 * @param {string} options.version
 * @param {string} options.dlDomain
 * @param {string} options.favouriteEndpoint
 */
function BaseDID(url, options) {
    if (typeof url === 'object') {
        options = url;
        url = undefined;
    }

    this.url = url;
    this.KEY_LENGTH = 32;
    this.options = options || {};
    this.dlDomain = this.options.dlDomain;
    this.key = this.options.key;
    this.favouriteEndpoint = this.options.favouriteEndpoint;
    this.version = options.version;

    this.hashAlgorithm = null;
    this.encryptionAlgorithm = null;
    this.signatureAlgorithm = null;
    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * Choose and set cryptography algorithms
     * based on DID version
     *
     * @throws Error
     */
    const setupCryptoAlgorithmsScheme = () => {
        const algorithms = CryptoAlgorithmsSchemeVersioning[this.version];

        if (typeof algorithms !== 'object') {
            throw new Error(`Unable to find crypto algorithms scheme based on version: ${this.version}`);
        }

        this.setEncryptionAlgorithm(algorithms.encryption);
        this.setHashAlgorithm(algorithms.hash);
        this.setSignatureAlgorithm(algorithms.signature);
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    /**
     * @return {string}
     */
    this.getAnchorAlias = () => {
        throw new Error('Unimplemented');
    }

    /**
     * @return {string}
     */
    this.getDLDomain = () => {
        return this.dlDomain;
    }

    /**
     * @return {string}
     */
    this.getFavouriteEndpoint = () => {
        return this.favouriteEndpoint;
    }

    /**
     * @return {Buffer}
     */
    this.getKey = () => {
        return this.key;
    }

    /**
     * @return {string}
     */
    this.getKeyHash = () => {
        const key = this.getKey();
        let keyHash;

        if (key) {
            keyHash = crypto.pskHash(key, 'hex');
        }

        return keyHash;
    }


    /**
     * @return {string}
     */
    this.toUrl = () => {
        throw new Error('Unimplemented');
    }

    /**
     * @return {string}
     * @throws Error
     */
    this.getHashAlgorithm = () => {
        if (!this.hashAlgorithm) {
            setupCryptoAlgorithmsScheme();
        }
        return this.hashAlgorithm;
    }

    /**
     * @return {string}
     * @throws Error
     */
    this.getEncryptionAlgorithm = () => {
        if (!this.encryptionAlgorithm) {
            setupCryptoAlgorithmsScheme();
        }
        return this.encryptionAlgorithm;
    }

    /**
     * @return {string}
     * @throws Error
     */
    this.getSignatureAlgorithm = () => {
        if (!this.encryptionAlgorithm) {
            setupCryptoAlgorithmsScheme();
        }
        return this.signatureAlgorithm;
    }

    /**
     * @param {string} alg
     */
    this.setHashAlgorithm = (alg) => {
        this.hashAlgorithm = alg;
    }

    /**
     * @param {string} alg
     */
    this.setEncryptionAlgorithm = (alg) => {
        this.encryptionAlgorithm = alg;
    }

    /**
     * @param {string} alg
     */
    this.setSignatureAlgorithm = (alg) => {
        this.signatureAlgorithm = alg;
    }
}

module.exports = BaseDID;
