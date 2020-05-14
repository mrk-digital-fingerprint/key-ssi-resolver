'use strict';

const barModule = require('bar');
const fsAdapter = require('bar-fs-adapter');

function BarFactory(bootstrapingService) {

    this.create = (options, callback) => {
        const ArchiveConfigurator = barModule.ArchiveConfigurator;
        ArchiveConfigurator.prototype.registerFsAdapter("FsAdapter", fsAdapter.createFsAdapter);
        const archiveConfigurator = new ArchiveConfigurator();
        archiveConfigurator.setFsAdapter("FsAdapter");
        archiveConfigurator.setBufferSize(65535);
        archiveConfigurator.setEncryptionAlgorithm("aes-256-gcm");
        archiveConfigurator.setDID(options.did);
        archiveConfigurator.setBootstrapingService(bootstrapingService);

        const bar = barModule.createArchive(archiveConfigurator);
        bar.load((err) => {
            if (err) {
                return callback(err);
            }

            return callback(undefined, bar);
        });
    }

}

module.exports = BarFactory;
