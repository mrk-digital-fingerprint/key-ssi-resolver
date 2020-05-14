'use strict';

const BarFactory = require('./BarFactory');
const RawDossierFactory = require('./RawDossierFactory');
const constants = require('../constants');

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 */
function DSUFactory(options) {
    options = options || {};

    this.bootstrapingService = options.bootstrapingService;
    this.dlDomain = options.dlDomain;
    this.registeredTypes = {};

    if (!this.bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    if (!this.dlDomain) {
        throw new Error('DLDomain is required');
    }

    /**
     * Initialize the factory state
     */
    const initialize = () => {
        const BUILTIN_DSU_TYPES = constants.BUILTIN_DSU_TYPES;

        this.registerType(BUILTIN_DSU_TYPES.Bar, new BarFactory({
            bootstrapingService: this.bootstrapingService,
            dlDomain: this.dlDomain
        }));
        this.registerType(BUILTIN_DSU_TYPES.RawDossier, new RawDossierFactory({
            bootstrapingService: this.bootstrapingService,
            dlDomain: this.dlDomain
        }));
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
