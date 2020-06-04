'use strict';

const barModule = require('bar');
const fsAdapter = require('bar-fs-adapter');
const cache = require('psk-cache').factory();

const constants = require('../constants');
const didTypes = constants.didTypes;
const DEFAULT_BAR_MAP_STRATEGY = constants.DEFAULT_BAR_MAP_STRATEGY;

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 * @param {DIDFactory} options.didFactory
 * @param {BarMapStrategyFactory} options.barMapStrategyFactory
 */
function BarFactory(options) {
    options = options || {};
    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain;
    this.didFactory = options.didFactory;
    this.barMapStrategyFactory = options.barMapStrategyFactory;

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {BaseDID} did
     * @param {object} options
     * @return {Archive}
     */
    const createInstance = (did, options) => {
        const ArchiveConfigurator = barModule.ArchiveConfigurator;
        ArchiveConfigurator.prototype.registerFsAdapter("FsAdapter", fsAdapter.createFsAdapter);
        const archiveConfigurator = new ArchiveConfigurator();
        archiveConfigurator.setCache(cache);
        archiveConfigurator.setFsAdapter("FsAdapter");
        archiveConfigurator.setBufferSize(65535);
        archiveConfigurator.setEncryptionAlgorithm("aes-256-gcm");
        archiveConfigurator.setDID(did);
        archiveConfigurator.setBootstrapingService(this.bootstrapingService);

        let barMapStrategyName = options.barMapStrategy;
        let anchoringOptions = options.anchoringOptions;
        if (!barMapStrategyName) {
            barMapStrategyName = DEFAULT_BAR_MAP_STRATEGY;
        }
        const barMapStrategy = createBarMapStrategy(barMapStrategyName, anchoringOptions);

        archiveConfigurator.setBarMapStrategy(barMapStrategy);

        if (options.validationRules) {
            archiveConfigurator.setValidationRules(options.validationRules);
        }

        const bar = barModule.createArchive(archiveConfigurator);
        return bar;
    }

    /**
     * @return {object}
     */
    const createBarMapStrategy = (name, options) => {
        const strategy = this.barMapStrategyFactory.create(name, options);
        return strategy;
    }

    /**
     * @param {object} options
     * @return {SecretDID}
     */
    const createDID = (options) => {
        return this.didFactory.create(didTypes.SECRET, {
            dlDomain: this.dlDomain,
            favouriteEndpoint: options.favouriteEndpoint
        });
    }

    /**
     * @param {string} did
     * @return {BaseDID}
     */
    const restoreDID = (did) => {
        return this.didFactory.create(did);
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {object} options
     * @param {string} options.favouriteEndpoint
     * @param {string} options.barMapStrategy 'Diff', 'Versioned' or any strategy registered with the factory
     * @param {object} options.anchoringOptions Anchoring options to pass to bar map strategy
     * @param {callback} options.anchoringOptions.decisionFn Callback which will decide when to effectively anchor changes
     *                                                              If empty, the changes will be anchored after each operation
     * @param {callback} options.anchoringOptions.conflictResolutionFn Callback which will handle anchoring conflicts
     *                                                              The default strategy is to reload the BarMap and then apply the new changes
     * @param {callback} options.anchoringOptions.anchoringCb A callback which is called when the strategy anchors the changes
     * @param {callback} options.anchoringOptions.signingFn  A function which will sign the new alias
     * @param {object} options.validationRules 
     * @param {object} options.validationRules.preWrite An object capable of validating operations done in the "preWrite" stage of the BarMap
     * @param {callback} callback
     */
    this.create = (options, callback) => {
        options = options || {};
        let did;

        try {
            did = createDID(options);
        } catch (e) {
            return callback(e);
        }

        const bar = createInstance(did, options);
        bar.init((err) => {
            if (err) {
                return callback(err);
            }

            return callback(undefined, bar);
        });
    }

    /**
     * @param {string} did
     * @param {object} options
     * @param {string} options.barMapStrategy 'Diff', 'Versioned' or any strategy registered with the factory
     * @param {object} options.anchoringOptions Anchoring options to pass to bar map strategy
     * @param {callback} options.anchoringOptions.decisionFn Callback which will decide when to effectively anchor changes
     *                                                              If empty, the changes will be anchored after each operation
     * @param {callback} options.anchoringOptions.conflictResolutionFn Callback which will handle anchoring conflicts
     *                                                              The default strategy is to reload the BarMap and then apply the new changes
     * @param {callback} options.anchoringOptions.anchoringCb A callback which is called when the strategy anchors the changes
     * @param {callback} options.anchoringOptions.signingFn  A function which will sign the new alias
     * @param {object} options.validationRules 
     * @param {object} options.validationRules.preWrite An object capable of validating operations done in the "preWrite" stage of the BarMap
     * @param {callback} callback
     */
    this.load = (did, options, callback) => {
        options = options || {};
        let didInstance;

        try {
            didInstance = restoreDID(did);
        } catch (e) {
            return callback(e);
        }

        const bar = createInstance(didInstance, options);
        bar.load((err) => {
            if (err) {
                return callback(err);
            }

            return callback(undefined, bar);
        })
    }
}

module.exports = BarFactory;
