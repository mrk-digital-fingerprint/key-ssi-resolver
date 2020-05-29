'use strict';

const constants = require('../constants');
const SimpleAnchorVerificationStrategy = require('./SimpleAnchorVerificationStrategy');
const DiffAnchorVerificationStrategy = require('./DiffAnchorVerificationStrategy');

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
        const builtinStrategies = constants.builtinAnchorVerificationStrategies;
        this.registerStrategy(builtinStrategies.SIMPLE, this.createSimpleStrategy);
        this.registerStrategy(builtinStrategies.DIFF, this.createDiffStrategy);
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
     * @return {SimpleAnchorVerificationStrategy}
     */
    this.createSimpleStrategy = (options) => {
        return new SimpleAnchorVerificationStrategy(options);
    }

    /**
     * @param {object} options
     * @return {DiffAnchorVerificationStrategy}
     */
    this.createDiffStrategy = (options) => {
        return new DiffAnchorVerificationStrategy(options);
    }

    initialize();
}

module.exports = Factory;
