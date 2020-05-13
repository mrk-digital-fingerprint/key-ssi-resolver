'use strict';

const SecretDID = require('./DID/SecretDID');
const constants = require('./constants');
const DSUFactory = require('./DSUFactory');

function DIDResolver(options) {
    options = options || {};

    this.bootstrapingService = options.bootstrapingService;
    // TODO: Should the DIDResolve be configured with the domain?
    //       or should the domain be passed as an option to createDID?
    this.dlDomain = options.dlDomain || constants.DEFAULT_DOMAIN;

    if (!this.bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    this.dsuFactory = new DSUFactory(this.bootstrapingService);

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////
    const isValidDSUType = (type) => {
        return typeof constants.DSU_TYPES[type] === 'string';
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    // TODO: Shouldn't this be named 'createDSU'?
    // TODO: Who sets the initial 'favouriteEndpoint'?
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
                dlDomain: this.dlDomain // TODO: Should this be an argument
            });
        } catch (e) {
            return callback(e);
        }

        this.dsuFactory.create(dsuType, {
            did: secretDID,
            anchoringStrategy
        }, callback);
    };

    this.loadDSU = (did, dsuType, verificationStrategy, anchoringStrategy, callback) => {
        if (typeof anchoringStrategy === 'function') {
            callback = anchoringStrategy;
            anchoringStrategy = null;
        }

        if (!isValidDSUType(dsuType)) {
            return callback(new Error(`Invalid DSU type: ${dsuType}`));
        }

        // TODO: actual implementation
    };

}

module.exports = DIDResolver;
