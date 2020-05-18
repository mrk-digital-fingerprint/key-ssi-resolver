'use strict';

const constants = require('./constants');
const DSUFactory = require('./DSUFactory').Factory;
const DIDFactory = require('./DID/Factory');

/**
 * @param {string} options.dlDomain
 * @param {BoostrapingService} options.bootstrapingService
 * @param {DSUFactory} options.dsuFactory
 */
function KeyDIDResolver(options) {
    options = options || {};

    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain || constants.DEFAULT_DOMAIN;

    if (!this.bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    if (!this.dlDomain) {
        throw new Error('DLDomain is required');
    }

    this.dsuFactory = options.dsuFactory || new DSUFactory({
        bootstrapingService: this.bootstrapingService,
        dlDomain: this.dlDomain,
        didFactory: new DIDFactory
    });

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} dsuRepresentation
     * @param {object} options
     * @param {string} options.favouriteEndpoint
     * @param {object} options.anchoringStrategy
     * @param {callback} callback
     */
    this.createDSU = (dsuRepresentation, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        if (!this.dsuFactory.isValidRepresentation(dsuRepresentation)) {
            return callback(new Error(`Invalid DSU representation: ${dsuRepresentation}`));
        }

        this.dsuFactory.create(dsuRepresentation, options, callback);
    };

    this.loadDSU = (did, dsuRepresentation, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }


        // TODO: actual implementation
    };

    /**
     * @return {DSUFactory}
     */
    this.getDSUFactory = () => {
        return this.dsuFactory;
    }

    /**
     * @return {BootstrapingService}
     */
    this.getBootstrapingService = () => {
        return this.bootstrapingService;
    }
}

module.exports = KeyDIDResolver;
