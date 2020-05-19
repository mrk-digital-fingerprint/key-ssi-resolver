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
    this.didFactory = options.didFactory;
    this.registeredRepresentations = {};

    if (!this.bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    if (!this.dlDomain) {
        throw new Error('DLDomain is required');
    }

    if (!this.didFactory) {
        throw new Error('A DID factory is required');
    }

    /**
     * Initialize the factory state
     */
    const initialize = () => {
        const BUILTIN_DSU_REPR = constants.BUILTIN_DSU_REPR;

        const barFactory = new BarFactory({
            bootstrapingService: this.bootstrapingService,
            dlDomain: this.dlDomain,
            didFactory: this.didFactory
        });

        const rawDossierFactory = new RawDossierFactory({
            barFactory
        });

        this.registerRepresentation(BUILTIN_DSU_REPR.Bar, barFactory);
        this.registerRepresentation(BUILTIN_DSU_REPR.RawDossier, rawDossierFactory);
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

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

    /**
     * @param {string} did
     * @param {string} representation
     * @param {object} dsuConfiguration
     * @param {callback} callback
     */
    this.load = (did, representation, dsuConfiguration, callback) => {
        const factory = this.registeredRepresentations[representation];
        return factory.load(did, dsuConfiguration, callback);
    }

    initialize();
}

module.exports = DSUFactory;
