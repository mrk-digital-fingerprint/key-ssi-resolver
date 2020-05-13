'use strict';

const SecretDID = require('./DID/SecretDID');
const constants = require('./constants');

function DIDResolver(options) {
    options = options || {};

    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain || constants.DEFAULT_DOMAIN;

    if (!this.bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////
    const isValidDSUType = (type) => {
        return typeof constants.DSU_TYPES[type] === 'string';
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    this.createDID = (dsuType, anchoringStrategy, callback) => {
        if (typeof anchoringStrategy === 'function') {
            callback = anchoringStrategy;
            anchoringStrategy = null;
        }

        if (!isValidDSUType(dsuType)) {
            return callback(new Error(`Invalid DSU type: ${dsuType}`));
        }

        let secretDID;
        try {
            secretDID = new SecretDID({
                dlDomain: this.dlDomain
            });
        } catch (e) {
            return callback(e);
        }

    };

    this.loadDSU = (did, dsuType, verificationStrategy, anchoringStrategy, callback) => {
        if (typeof anchoringStrategy === 'function') {
            callback = anchoringStrategy;
            anchoringStrategy = null;
        }

        if (!isValidDSUType(dsuType)) {
            return callback(new Error(`Invalid DSU type: ${dsuType}`));
        }
    };

}

module.exports = DIDResolver;
