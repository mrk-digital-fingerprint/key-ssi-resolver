'use strict';

const constants = require('../constants');
const DID_VERSION = constants.DID_VERSION;
const DID_TYPES = constants.DID_TYPES;

const DIDUrl = require('./DIDUrl');
const SecretDID = require('./SecretDID');
const ZKDID = require('./ZKDID');

/**
 * @param {object} options
 */
function DIDFactory(options) {
    options = options || {};

    const version = options.version || DID_VERSION
    const urlToTypeMapping = {
        'sa': DID_TYPES.Secret,
        'alias': DID_TYPES.ZK
    }
    const factories = {};

    const initialize = () => {
        factories[DID_TYPES.Secret] = createSecretDID;
        factories[DID_TYPES.ZK] = createZKDID;
    };

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} url
     * @return {string|undefined}
     */
    const detectTypeFromURL = (url) => {
        let didUrl;
        try {
            didUrl = new DIDUrl(url);
        } catch (e) {
            return;
        }

        const typeIdentifier = didUrl.getType();
        return urlToTypeMapping[typeIdentifier];
    };

    /**
     * @param {string} type
     * @return {function}
     */
    const isValidType = (type) => {
        return typeof factories[type] === 'function';
    }

    /**
     * @param {string} url
     * @param {object} options
     * @param {string} options.key
     * @param {string} options.dlDomain
     * @param {string} options.favouriteEndpoint
     * @return {BaseDID}
     */
    const createSecretDID = (url, options) => {
        options.didFactory = this;
        return new SecretDID(url, options);
    }

    /**
     * @param {string} url
     * @param {object} options
     * @param {string} options.dlDomain
     * @param {string} options.favouriteEndpoint
     * @return {BaseDID}
     */
    const createZKDID = (url, options) => {
        return new ZKDID(url, options);
    }

    initialize();

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} url
     * @param {string} type
     * @param {object} options Parameter required when creating a new DID
     * @param {string} options.key
     * @param {string} options.dlDomain
     * @param {string} options.favouriteEndpoint
     * @return {BaseDID}
     */
    this.create = (url, type, options) => {
        if (typeof type === 'object') {
            options = type;
            type = url;
            url = undefined;
        }

        if (url && typeof type === 'undefined' && typeof options === 'undefined') {
            type = detectTypeFromURL(url);

            if (!type) {
                throw new Error('Invalid URL. Are you trying to create a new DID? Make sure you pass the options object');
            }
        }

        if (!isValidType(type)) {
            throw new Error('Invalid DID type');
        }

        const factoryMethod = factories[type];
        options = options || {};

        return factoryMethod(url, options);
    }
}

module.exports = DIDFactory;
