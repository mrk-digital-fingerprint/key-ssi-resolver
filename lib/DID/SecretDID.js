'use strict';
const crypto = require("pskcrypto");
const nodeUtils = require('util');

const DIDUrl = require('./DIDUrl');
const ZKDID = require('./ZKDID');
const BaseDID = require('./BaseDID');

const DID_TYPES = require('../constants').DID_TYPES;

/**
 * @param {string|object} url
 * @param {object|undefined} options
 * @param {string} options.key
 * @param {string} options.dlDomain
 * @param {string} options.favouriteEndpoint
 */
function SecretDID(url, options) {
    BaseDID.call(this, url, options);

    this.key = this.options.key;
    this.zkdid = null;
    this.didFactory = options.didFactory;

    if (!this.didFactory) {
        throw new Error('A DID Factory is required');
    }

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////
    /**
     * Restore DID data from url
     *
     * @param {string} url
     */
    const restoreFromUrl = (url) => {
        const didUrl = new DIDUrl(url, {
            validator: {
                prefix: 'kdid',
                type: 'sa',
                segments: (segments) => {
                    if (segments.length !== 2) {
                        return false;
                    }

                    if (!segments[0].length || !segments[1].length) {
                        return false;
                    }

                    return true;
                }
            }
        });

        const segments = didUrl.getSegments();
        this.dlDomain = segments.shift();
        this.key = crypto.pskBase58Decode(segments.pop());
        this.favouriteEndpoint = didUrl.getHashFragment();
    }

    /**
     * @return {Buffer}
     */
    const generateKey = () => {
        const key = Buffer.from(crypto.randomBytes(this.KEY_LENGTH));
        return key;
    }

    /**
     * Initialize the DID state
     */
    const initialize = () => {
        if (this.url) {
            restoreFromUrl(this.url);
            return;
        }
        if (!this.key) {
            this.key = generateKey();
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
        const zkdid = this.getZKDID();
        return zkdid.getAnchorAlias();
    }

    /**
     * @return {Buffer}
     */
    this.getKey = () => {
        return this.key;
    }

    /**
     * @return {ZKDID}
     */
    this.getZKDID = () => {
        if (!this.zkdid) {
            this.zkdid = this.didFactory.create(DID_TYPES.ZK, {
                dlDomain: this.dlDomain,
                secret: this.key.toString('hex'),
                favouriteEndpoint: this.favouriteEndpoint
            });
        }
        return this.zkdid;
    }

    /**
     * @param {boolean} includeHashFragment
     * @return {string}
     */
    this.toUrl = (includeHashFragment) => {
        includeHashFragment = (typeof includeHashFragment === 'undefined') ? true : includeHashFragment;
        const urlParts = {
            type: 'sa',
            segments: [
                this.dlDomain,
                crypto.pskBase58Encode(this.key)
            ],
        }
        if (includeHashFragment) {
            urlParts.hashFragment = this.favouriteEndpoint;
        }

        const didUrl = new DIDUrl(urlParts);
        return didUrl.toString();
    }
}
nodeUtils.inherits(SecretDID, BaseDID);

module.exports = SecretDID;

