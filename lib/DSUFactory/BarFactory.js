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
        let did;

        try {
            did = this.createDID();
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
        archiveConfigurator.setDID(options.did);
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
     * @return {SecretDID}
     */
    this.createDID = () => {
        return new SecretDID({
            dlDomain: this.dlDomain
        });
    }

}

module.exports = BarFactory;
