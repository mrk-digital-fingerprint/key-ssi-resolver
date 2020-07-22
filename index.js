'use strict';

const KeySSIResolver = require('./lib/KeySSIResolver');
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

    const keySSIResolver = new KeySSIResolver({
        bootstrapingService,
        dlDomain: options.dlDomain
    });

    return keySSIResolver;
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
    $$.keySSIResolver = factory(options);
    $$.dsuFactory = $$.keySSIResolver.getDSUFactory();
    $$.bootstrapingService = $$.keySSIResolver.getBootstrapingService();
    $$.barMapStrategyFactory = $$.keySSIResolver.getBarMapStrategyFactory();
}

module.exports = {
    initialize,
    constants,
    DIDMixin: require('./lib/DID/DIDMixin'),
    BarMapStrategyMixin: require('./lib/BarMapStrategy/BarMapStrategyMixin'),
    // TODO: exposed for compatibility reasons. Remove it after switching completely to psk-key-did-resolver
    BarMapStrategyFactory: require('./lib/BarMapStrategy/Factory')
};
