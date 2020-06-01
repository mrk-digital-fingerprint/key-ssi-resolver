'use strict';

const constants = require('./constants');
const DSUFactory = require('./DSUFactory').Factory;
const DIDFactory = require('./DID/Factory');
const AnchoringStrategyFactory = require('./AnchoringStrategy').Factory;

/**
 * @param {string} options.dlDomain
 * @param {BoostrapingService} options.bootstrapingService
 * @param {AnchoringStrategyFactory} options.anchoringStrategyFactory
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

    const anchoringStrategyFactory = options.anchoringStrategyFactory || new AnchoringStrategyFactory();

    const dsuFactory = options.dsuFactory || new DSUFactory({
        bootstrapingService,
        dlDomain,
        anchoringStrategyFactory,
        didFactory: new DIDFactory
    });


    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} dsuRepresentation
     * @param {object} options
     * @param {string} options.favouriteEndpoint
     * @param {string} options.anchoringStrategy 'Diff', 'Versioned' or any strategy registered with the factory
     * @param {object} options.anchoringOptions Options to pass to anchoring strategy
     * @param {callback} options.anchoringOptions.decissionCb Callback which will decide when to effectively anchor changes
     *                                                              If empty, the changes will be anchored after each operation
     * @param {callback} options.anchoringOptions.conflictResolutionCb Callback which will handle anchoring conflicts
     *                                                              The default strategy is to reload the BarMap and then apply the new changes
     * @param {object} options.verificationStrategy 'Default'
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
     * @param {string} options.anchoringStrategy 'Diff', 'Versioned' or any strategy registered with the factory
     * @param {object} options.anchoringOptions Options to pass to anchoring strategy
     * @param {callback} options.anchoringOptions.decissionCb Callback which will decide when to effectively anchor changes
     *                                                              If empty, the changes will be anchored after each operation
     * @param {callback} options.anchoringOptions.conflictResolutionCb Callback which will handle anchoring conflicts
     *                                                              The default strategy is to reload the BarMap and then apply the new changes
     * @param {object} options.verificationStrategy 'Default'
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

    this.getAnchoringStrategyFactory = () => {
        return anchoringStrategyFactory;
    }
}

module.exports = KeyDIDResolver;
