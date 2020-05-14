'use strict';

const constants = require('./constants');
const DSUFactory = require('./DSUFactory').Factory;

/**
 * @param {string} options.dlDomain
 * @param {BoostrapingService} options.bootstrapingService
 * @param {DSUFactory} options.dsuFactory
 */
function DIDResolver(options) {
    options = options || {};

    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain || constants.DEFAULT_DOMAIN;

    if (!this.bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    this.dsuFactory = options.dsuFactory || new DSUFactory({
        bootstrapingService: this.bootstrapingService,
        dlDomain: this.dlDomain
    });

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} dsuType
     * @param {object} options
     * @param {string} options.favouriteEndpoint
     * @param {object} options.anchoringStrategy
     * @param {callback} callback
     */
    this.createDSU = (dsuType, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        if (!this.dsuFactory.isValidDSUType(dsuType)) {
            return callback(new Error(`Invalid DSU type: ${dsuType}`));
        }

        this.dsuFactory.create(dsuType, options, callback);
    };

    this.loadDSU = (did, dsuType, verificationStrategy, anchoringStrategy, callback) => {
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

module.exports = DIDResolver;
