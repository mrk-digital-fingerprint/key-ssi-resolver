'use strict';

const constants = require('../constants');
const SimpleAnchorVerificationStrategy = require('./SimpleAnchorVerificationStrategy');

/**
 * @param {object} options
 */
function Factory(options) {
    options = options || {};

    const factories = {};

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    const initialize = () => {
        const BUILTIN_STRATEGIES = constants.BUILTIN_ANCHOR_VERIFICATION_STRATEGIES;
        this.registerStrategy(BUILTIN_STRATEGIES.Simple, this.createSimpleStrategy);
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} strategyName
     * @param {object} factory
     */
    this.registerStrategy = (strategyName, factory) => {
        factories[strategyName] = factory;
    }

    /**
     * @param {string} strategyName
     * @param {object} options
     * @return {BaseAnchorVerificationStrategy}
     */
    this.create = (strategyName, options) => {
        const factory = factories[strategyName];
        options = options || {};
        return factory(options);
    }

    /**
     * @param {object} options
     * @return SimpleAnchorVerificationStrategy
     */
    this.createSimpleStrategy = (options) => {
        return new SimpleAnchorVerificationStrategy(options);
    }

    initialize();
}

module.exports = Factory;
