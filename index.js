'use strict';

const DIDResolver = require('./lib/DIDResolver');
const BootstrapingService = require('./lib/BootstrapingService').Service;
const constants = require('./lib/constants');

let didResolver;

/**
 * @param {object} options
 * @param {object} options.endpointsConfiguration
 * @param {Array<object>} options.endpointsConfiguration.brickEndpoints
 * @param {Array<object>} options.endpointsConfiguration.aliasEndpoints
 */
function factory(options) {
    options = options || {};
    const bootstrapingService = new BootstrapingService(options.endpointsConfiguration);

    const didResolver = new DIDResolver({
        bootstrapingService,
        dlDomain: options.dlDomain
    });

    return didResolver;
}

/**
 * @param {object} options
 * @param {object} options.endpointsConfiguration
 * @param {Array<object>} options.endpointsConfiguration.brick
 * @param {Array<object>} options.endpointsConfiguration.alias
 */
function initialize(options) {
    didResolver = factory(options);
}

module.exports = {
    factory,
    initialize,
    constants,
    DID: {
        SecretDID: require('./lib/DID/SecretDID'),
        ZKDID: require('./lib/DID/ZKDID')
    }
};
