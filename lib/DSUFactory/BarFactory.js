'use strict';

const barModule = require('bar');
const fsAdapter = require('bar-fs-adapter');
const cache = require('psk-cache').factory();

const DID_TYPES = require('../constants').DID_TYPES;

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 * @param {DIDFactory} options.didFactory
 */
function BarFactory(options) {
    options = options || {};
    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain;
    this.didFactory = options.didFactory;

    /**
     * @param {object} options
     * @param {callback} callback
     */
    this.create = (options, callback) => {
        options = options || {};
        let did;

        try {
            did = this.createDID(options);
        } catch (e) {
            return callback(e);
        }

        const bar = this.createInstance(did, options);
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
            didInstance = this.restoreDID(did);
        } catch (e) {
            return callback(e);
        }

        const bar = this.createInstance(didInstance, options);
        bar.load((err) => {
            if (err) {
                return callback(err);
            }

            return callback(undefined, bar);
        })
    }

    /**
     * @param {BaseDID} did
     * @param {object} options
     * @return {Archive}
     */
    this.createInstance = (did, options) => {
        const ArchiveConfigurator = barModule.ArchiveConfigurator;
        ArchiveConfigurator.prototype.registerFsAdapter("FsAdapter", fsAdapter.createFsAdapter);
        const archiveConfigurator = new ArchiveConfigurator();
        archiveConfigurator.setCache(cache);
        archiveConfigurator.setFsAdapter("FsAdapter");
        archiveConfigurator.setBufferSize(65535);
        archiveConfigurator.setEncryptionAlgorithm("aes-256-gcm");
        archiveConfigurator.setDID(did);
        archiveConfigurator.setBootstrapingService(this.bootstrapingService);

        // TODO: remove this
        archiveConfigurator.setSeedEndpoint('http://localhost:8080');

        const bar = barModule.createArchive(archiveConfigurator);
        return bar;
    }

    /**
     * @param {object} options
     * @return {SecretDID}
     */
    this.createDID = (options) => {
        return this.didFactory.create(DID_TYPES.Secret, {
            dlDomain: this.dlDomain,
            favouriteEndpoint: options.favouriteEndpoint
        });
    }

    /**
     * @param {string} did
     * @return {BaseDID}
     */
    this.restoreDID = (did) => {
        return this.didFactory.create(did);
    }
}

module.exports = BarFactory;
