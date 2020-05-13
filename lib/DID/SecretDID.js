'use strict';
const crypto = require("pskcrypto");
const base58 = require('bar').base58;
const DIDUrl = require('./DIDUrl');
const ZKDID = require('./ZKDID');

function SecretDID(url, options) {
    if (typeof url === 'object') {
        options = url;
        url = undefined;
    }

    const KEY_LENGTH = 32;
    options = options || {};

    this.key = options.key;
    this.dlDomain = options.dlDomain;
    this.favouriteEndpoint = options.favouriteEndpoint;

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////
    const restoreFromUrl = (url) => {
        const didUrl = new DIDUrl(url, {
            validator: {
                prefix: 'did',
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

        this.dlDomain = didUrl.getSegments().shift();
        this.key = base58.decode(didUrl.getSegments().pop());
        this.favouriteEndpoint = didUrl.getHashFragment();
    }

    const generateKey = () => {
        const key = Buffer.from(crypto.randomBytes(KEY_LENGTH));
        return key;
    }

    const initialize = () => {
        if (url) {
            restoreFromUrl(url);
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
    this.getDLDomain = () => {
        return this.dlDomain;
    }

    this.getKey = () => {
        return this.key;
    }

    this.getFavouriteEndpoint = () => {
        return this.favouriteEndpoint;
    }

    this.getZKDID = () => {
        const zkdid = new ZKDID({
            dlDomain: this.dlDomain
        });
        return zkdid;
    }

    this.toUrl = (includeHashFragment) => {
        includeHashFragment = (typeof includeHashFragment === 'undefined') ? true : includeHashFragment;
        const urlParts = {
            type: 'sa',
            segments: [
                this.dlDomain,
                base58.encode(this.key)
            ],
        }
        if (includeHashFragment) {
            urlParts.hashFragment = this.favouriteEndpoint;
        }

        const didUrl = new DIDUrl(urlParts);
        return didUrl.toString();
    }
}

module.exports = SecretDID;

