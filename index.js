'use strict';

const KeyDIDResolver = require('./lib/KeyDIDResolver');
const BootstrapingService = require('./lib/BootstrapingService').Service;
const constants = require('./lib/constants');

/**
 * Create a new KeyDIDResolver instance
 * @param {object} options
 * @param {object} options.endpointsConfiguration
 * @param {Array<object>} options.endpointsConfiguration.brickEndpoints
 * @param {Array<object>} options.endpointsConfiguration.aliasEndpoints
 */
function factory(options) {
    options = options || {};
    const bootstrapingService = new BootstrapingService(options.endpointsConfiguration);

    const keyDidResolver = new KeyDIDResolver({
        bootstrapingService,
        dlDomain: options.dlDomain
    });

    return keyDidResolver;
}

/**
 * Create a new KeyDIDResolver instance and append it to
 * global object $$
 *
 * @param {object} options
 * @param {object} options.endpointsConfiguration
 * @param {Array<object>} options.endpointsConfiguration.brick
 * @param {Array<object>} options.endpointsConfiguration.alias
 * @param {string} options.dlDomain
 */
function initialize(options) {
    $$.keyDidResolver = factory(options);
    $$.dsuFactory = keyDidResolver.getDSUFactory();
    $$.bootstrapingService = keyDidResolver.getBootstrapingService();
    $$.anchorVerificationStrategy = keyDidResolver.getAnchorVerificationStrategyFactory();
}

module.exports = {
    initialize,
    constants
};
