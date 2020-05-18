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
    this.registeredRepresentations = {};

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
        const BUILTIN_DSU_REPR = constants.BUILTIN_DSU_REPR;

        this.registerRepresentation(BUILTIN_DSU_REPR.Bar, new BarFactory({
            bootstrapingService: this.bootstrapingService,
            dlDomain: this.dlDomain
        }));
        this.registerRepresentation(BUILTIN_DSU_REPR.RawDossier, new RawDossierFactory({
            bootstrapingService: this.bootstrapingService,
            dlDomain: this.dlDomain
        }));
    }

    /**
     * @param {string} representation
     * @return {boolean}
     */
    this.isValidRepresentation = (representation) => {
        return typeof this.registeredRepresentations[representation] !== 'undefined';
    };

    /**
     * @param {string} representation
     * @param {object} factory
     */
    this.registerRepresentation = (representation, factory) => {
        this.registeredRepresentations[representation] = factory;
    }

    /**
     * @param {string} representation
     * @param {object} dsuConfiguration
     * @param {callback} callback
     */
    this.create = (representation, dsuConfiguration, callback) => {
        const factory = this.registeredRepresentations[representation];

        factory.create(dsuConfiguration, callback);
    }

    initialize();
}

module.exports = DSUFactory;
