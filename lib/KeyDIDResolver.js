'use strict';

const constants = require('./constants');
const DSUFactory = require('./DSUFactory').Factory;
const DIDFactory = require('./DID/Factory');
const BarMapStrategyFactory = require('./BarMapStrategy').Factory;

/**
 * @param {string} options.dlDomain
 * @param {BoostrapingService} options.bootstrapingService
 * @param {BarMapStrategyFactory} options.barMapStrategyFactory
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

    const barMapStrategyFactory = options.barMapStrategyFactory || new BarMapStrategyFactory();

    const dsuFactory = options.dsuFactory || new DSUFactory({
        bootstrapingService,
        dlDomain,
        barMapStrategyFactory: barMapStrategyFactory,
        didFactory: new DIDFactory
    });


    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} dsuRepresentation
     * @param {object} options
     * @param {string} options.favouriteEndpoint
     * @param {string} options.barMapStrategy 'Diff' or any strategy registered with the factory
     * @param {object} options.anchoringOptions Anchoring options to pass to bar map strategy
     * @param {callback} options.anchoringOptions.decisionFn A function which will decide when to effectively anchor changes
     *                                                              If empty, the changes will be anchored after each operation
     * @param {callback} options.anchoringOptions.conflictResolutionFn A function which will handle anchoring conflicts
     *                                                              The default strategy is to reload the BarMap and then apply the new changes
     * @param {callback} options.anchoringOptions.anchoringEventListener An event listener which is called when the strategy anchors the changes
     * @param {callback} options.anchoringOptions.signingFn  A function which will sign the new alias
     * @param {object} options.validationRules 
     * @param {object} options.validationRules.preWrite An object capable of validating operations done in the "preWrite" stage of the BarMap
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
     * @param {string} options.barMapStrategy 'Diff', 'Versioned' or any strategy registered with the factory
     * @param {object} options.anchoringOptions Anchoring options to pass to bar map strategy
     * @param {callback} options.anchoringOptions.decisionFn A function which will decide when to effectively anchor changes
     *                                                              If empty, the changes will be anchored after each operation
     * @param {callback} options.anchoringOptions.conflictResolutionFn Callback which will handle anchoring conflicts
     *                                                              The default strategy is to reload the BarMap and then apply the new changes
     * @param {callback} options.anchoringOptions.anchoringEventListener An event listener which is called when the strategy anchors the changes
     * @param {callback} options.anchoringOptions.signingFn  A function which will sign the new alias
     * @param {object} options.validationRules 
     * @param {object} options.validationRules.preWrite An object capable of validating operations done in the "preWrite" stage of the BarMap
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

    /**
     * @return {BarMapStrategyFactory}
     */
    this.getBarMapStrategyFactory = () => {
        return barMapStrategyFactory;
    }
}

module.exports = KeyDIDResolver;
