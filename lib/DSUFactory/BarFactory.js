'use strict';

const barModule = require('bar');
const fsAdapter = require('bar-fs-adapter');
const cache = require('psk-cache').factory();

const constants = require('../constants');
const didTypes = constants.didTypes;
const DEFAULT_ANCHORING_STRATEGY = constants.DEFAULT_ANCHORING_STRATEGY;

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 * @param {DIDFactory} options.didFactory
 * @param {AnchoringStrategyFactory} options.anchoringStrategyFactory
 */
function BarFactory(options) {
    options = options || {};
    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain;
    this.didFactory = options.didFactory;
    this.anchoringStrategyFactory = options.anchoringStrategyFactory;


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

        let anchoringStrategyName = options.anchoringStrategy;
        let anchoringStrategyOptions = options.anchoringStrategyOptions;
        if (!anchoringStrategyName) {
            anchoringStrategyName = DEFAULT_ANCHORING_STRATEGY;
        }
        const anchoringStrategy = createAnchoringStrategy(anchoringStrategyName, anchoringStrategyOptions);
        archiveConfigurator.setAnchoringStrategy(anchoringStrategy);

        const bar = barModule.createArchive(archiveConfigurator);
        return bar;
    }

    /**
     * @return {object}
     */
    const createAnchoringStrategy = (name, options) => {
        const strategy = this.anchoringStrategyFactory.create(name, options);
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
