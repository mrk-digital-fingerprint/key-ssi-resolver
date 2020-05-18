'use strict';
const crypto = require("pskcrypto");
const nodeUtils = require('util');

const DIDUrl = require('./DIDUrl');
const BaseDID = require('./BaseDID');

/**
 * @param {string|object} url
 * @param {object|undefined} options
 * @param {string} options.secret
 * @param {string} options.dlDomain
 * @param {string} options.favouriteEndpoint
 */
function ZKDID(url, options) {
    BaseDID.call(this, url, options);

    this.secret = this.options.secret;
    this.alias = this.options.alias;
    this.signature = null;

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} url
     */
    const restoreFromUrl = (url) => {
        const didUrl = new DIDUrl(url, {
            validator: {
                prefix: 'kdid',
                type: 'alias',
                segments: (segments) => {
                    if (segments.length !== 3) {
                        return false;
                    }

                    if (!segments[0].length || !segments[1].length || !segments[2].length) {
                        return false;
                    }

                    return true;
                }
            }
        });

        const segments = didUrl.getSegments();
        this.version = segments.shift();
        this.dlDomain = segments.shift();
        let aliasSegments = crypto.pskBase58Decode(segments.pop()).toString();
        aliasSegments = aliasSegments.split('-');
        if (aliasSegments.length !== 2) {
            throw new Error('Invalid alias');
        }

        this.alias = aliasSegments.shift();
        this.signature = aliasSegments.pop();
        this.favouriteEndpoint = didUrl.getHashFragment();
    }

    /**
     * @return {string}
     */
    const generateAlias = () => {
        if (!this.secret) {
            this.secret = Buffer.from(crypto.randomBytes(this.KEY_LENGTH));
        }

        const alias = crypto.pskHash(crypto.pskHash(this.secret), 'hex');
        return alias;
    }

    /**
     * @return {string}
     */
    const generateSignature = () => {
        if (!this.secret) {
            throw new Error('Missing did secret. Is the alias generated?');
        }

        const signature = crypto.pskHash(crypto.pskHash(this.secret) + crypto.pskHash(this.secret), 'hex')
        return signature;
    }

    /**
     * Initialize the DID state
     */
    const initialize = () => {
        if (this.url) {
            restoreFromUrl(this.url);
            return;
        }
        if (!this.alias) {
            this.alias = generateAlias();
            this.signature = generateSignature();
        }

        if (!this.dlDomain) {
            throw new Error('Missing the DLDomain');
        }
    }

    initialize();
    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    /**
     * @return {string}
     */
    this.getAnchorAlias = () => {
        return this.alias;
    }

    /**
     * @return {string}
     */
    this.getSignature = () => {
        return this.signature;
    }

    /**
     * @throws Error
     */
    this.getKey = () => {
        throw new Error('Unimplemented! TODO: Get key from Security Context');
    }

    /**
     * @return {string}
     */
    this.toUrl = () => {
        const urlParts = {
            type: 'alias',
            segments: [
                this.version,
                this.dlDomain,
                crypto.pskBase58Encode(`${this.alias}-${this.signature}`)
            ],
            hashFragment: this.favouriteEndpoint
        };

        const didUrl = new DIDUrl(urlParts);
        return didUrl.toString();
    }
}
nodeUtils.inherits(ZKDID, BaseDID);

module.exports = ZKDID;
