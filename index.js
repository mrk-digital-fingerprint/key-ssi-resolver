'use strict';

const DIDResolver = require('./lib/DIDResolver');
const BootstrapingService = require('./lib/BootstrapingService').Service;
const constants = require('./lib/constants');

/**
 * Create a new DIDResolver instance
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
 * Create a new DIDResolver instance and append it to
 * global object $$
 *
 * @param {object} options
 * @param {object} options.endpointsConfiguration
 * @param {Array<object>} options.endpointsConfiguration.brick
 * @param {Array<object>} options.endpointsConfiguration.alias
 * @param {string} options.dlDomain
 */
function initialize(options) {
    $$.didResolver = factory(options);
    $$.dsuFactory = didResolver.getDSUFactory();
    $$.bootstrapingService = didResolver.getBootstrapingService();
}

module.exports = {
    initialize,
    constants
};
