'use strict';

const barModule = require('bar');
const fsAdapter = require('bar-fs-adapter');
const cache = require('psk-cache').factory();

const SecretDID = require('../DID/SecretDID');

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 */
function BarFactory(options) {
    options = options || {};
    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain;

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
        bar.load((err) => {
            if (err) {
                return callback(err);
            }

            return callback(undefined, bar);
        });
    }

    /**
     * @param {object} options
     * @return {SecretDID}
     */
    this.createDID = (options) => {
        return new SecretDID({
            dlDomain: this.dlDomain,
            favouriteEndpoint: options.favouriteEndpoint
        });
    }

}

module.exports = BarFactory;
