'use strict';

const BarFactory = require('./BarFactory');
const RawDossierFactory = require('./RawDossierFactory');
const constants = require('../constants');

/**
 * @param {BootstrapingService} bootstrapingService
 */
function DSUFactory(bootstrapingService) {
    this.bootstrapingService = bootstrapingService;

    this.registeredTypes = {};

    /**
     * Initialize the factory state
     */
    const initialize = () => {
        const BUILTIN_DSU_TYPES = constants.BUILTIN_DSU_TYPES;

        this.registerType(BUILTIN_DSU_TYPES.Bar, new BarFactory(this.bootstrapingService));
        this.registerType(BUILTIN_DSU_TYPES.RawDossier, new RawDossierFactory(this.bootstrapingService));
    }

    /**
     * @param {string} type
     * @return {boolean}
     */
    this.isValidDSUType = (type) => {
        return typeof this.registeredTypes[type] !== 'undefined';
    };

    /**
     * @param {string} type
     * @param {object} factory
     */
    this.registerType = (type, factory) => {
        this.registeredTypes[type] = factory;
    }

    /**
     * @param {string} type
     * @param {object} dsuConfiguration
     * @param {callback} callback
     */
    this.create = (type, dsuConfiguration, callback) => {
        const factory = this.registeredTypes[type];

        factory.create(dsuConfiguration, callback);
    }

    initialize();
}

module.exports = DSUFactory;
