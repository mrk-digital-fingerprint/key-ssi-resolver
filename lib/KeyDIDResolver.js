'use strict';

const constants = require('./constants');
const DSUFactory = require('./DSUFactory').Factory;
const DIDFactory = require('./DID/Factory');
const AnchorVerificationStrategyFactory = require('./AnchorVerificationStrategies').Factory;

/**
 * @param {string} options.dlDomain
 * @param {BoostrapingService} options.bootstrapingService
 * @param {DSUFactory} options.dsuFactory
 */
function KeyDIDResolver(options) {
    options = options || {};

    const bootstrapingService = options.bootstrapingService;
    const dlDomain = options.dlDomain || constants.DEFAULT_DOMAIN;

    if (!bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    if (!dlDomain) {
        throw new Error('DLDomain is required');
    }

    const anchorVerificationStrategyFactory = options.anchorVerificationStrategyFactory || new AnchorVerificationStrategyFactory();

    const dsuFactory = options.dsuFactory || new DSUFactory({
        bootstrapingService,
        dlDomain,
        anchorVerificationStrategyFactory,
        didFactory: new DIDFactory
    });


    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} dsuRepresentation
     * @param {object} options
     * @param {string} options.favouriteEndpoint
     * @param {object} options.anchorVerificationStrategy
     * @param {callback} callback
     */
    this.createDSU = (dsuRepresentation, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        if (!dsuFactory.isValidRepresentation(dsuRepresentation)) {
            return callback(new Error(`Invalid DSU representation: ${dsuRepresentation}`));
        }

        dsuFactory.create(dsuRepresentation, options, callback);
    };

    /**
     * @param {string} did
     * @param {string} dsuRepresentation
     * @param {object} options
     * @param {object} options.anchorVerificationStrategy
     * @param {callback} callback
     */
    this.loadDSU = (did, dsuRepresentation, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        if (!dsuFactory.isValidRepresentation(dsuRepresentation)) {
            return callback(new Error(`Invalid DSU representation: ${dsuRepresentation}`));
        }

        dsuFactory.load(did, dsuRepresentation, options, callback);
    };

    /**
     * @return {DSUFactory}
     */
    this.getDSUFactory = () => {
        return dsuFactory;
    }

    /**
     * @return {BootstrapingService}
     */
    this.getBootstrapingService = () => {
        return bootstrapingService;
    }

    this.getAnchorVerificationStrategyFactory = () => {
        return anchorVerificationStrategyFactory;
    }
}

module.exports = KeyDIDResolver;
