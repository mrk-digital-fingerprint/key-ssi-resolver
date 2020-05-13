'use strict';

const DSU_TYPES = require('./constants').DSU_TYPES;
const barModule = require('bar');
const fsAdapter = require('bar-fs-adapter');

function DSUFactory(bootstrapingService) {
    this.bootstrapingService = bootstrapingService;

    this.factoryMethods = {};

    this.createBar = (options, callback) => {
        const ArchiveConfigurator = barModule.ArchiveConfigurator;
        ArchiveConfigurator.prototype.registerFsAdapter("FsAdapter", fsAdapter.createFsAdapter);
        const archiveConfigurator = new ArchiveConfigurator();
        archiveConfigurator.setFsAdapter("FsAdapter");
        archiveConfigurator.setBufferSize(65535);
        archiveConfigurator.setEncryptionAlgorithm("aes-256-gcm");
        archiveConfigurator.setDID(options.did);
        archiveConfigurator.setBootstrapingService(this.bootstrapingService);

        const bar = barModule.createArchive(archiveConfigurator);
        bar.load((err) => {
            if (err) {
                return callback(err);
            }

            return callback(undefined, bar);
        });
    }

    this.createRawDossier = (options, callback) => {

    }

    this.create = (type, options, callback) => {
        options = options || {};

        if (!options.did) {
            return callback(new Error('A did is required in order to create a DSU'));
        }

        const factoryMethod = this.factoryMethods[type];

        factoryMethod(options, callback);
    }

    this.factoryMethods[DSU_TYPES.Bar] = this.createBar;
    this.factoryMethods[DSU_TYPES.RawDossier] = this.createRawDossier;
}

module.exports = DSUFactory;
