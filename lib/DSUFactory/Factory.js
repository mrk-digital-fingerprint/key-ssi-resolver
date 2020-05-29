'use strict';

const BarFactory = require('./BarFactory');
const RawDossierFactory = require('./RawDossierFactory');
const constants = require('../constants');

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 * @param {DIDFactory} options.didFactory
 * @param {AnchorVerificationStrategyFactory} options.anchorVerificationStrategyFactory
 */
function Factory(options) {
    options = options || {};

    const bootstrapingService = options.bootstrapingService;
    const dlDomain = options.dlDomain;
    const didFactory = options.didFactory;
    const anchorVerificationStrategyFactory = options.anchorVerificationStrategyFactory;
    const factories = {};

    if (!bootstrapingService) {
        throw new Error('BootstrapingService is required');
    }

    if (!dlDomain) {
        throw new Error('DLDomain is required');
    }

    if (!didFactory) {
        throw new Error('A DID factory is required');
    }

    if (!anchorVerificationStrategyFactory) {
        throw new Error('An AnchorVerificationStrategy factory is required');
    }

    /**
     * Initialize the factory state
     */
    const initialize = () => {
        const builtinDSURepr = constants.builtinDSURepr;

        const barFactory = new BarFactory({
            bootstrapingService,
            dlDomain,
            didFactory,
            anchorVerificationStrategyFactory
        });

        const rawDossierFactory = new RawDossierFactory({
            barFactory
        });

        this.registerRepresentation(builtinDSURepr.BAR, barFactory);
        this.registerRepresentation(builtinDSURepr.RAW_DOSSIER, rawDossierFactory);

        const WebDossierFactory = require("./WebDossierFactory");
        const webDossierFactory = new WebDossierFactory({});
        this.registerRepresentation(builtinDSURepr.WEB_DOSSIER, webDossierFactory);

        const NodeDossierFactory = require("./NodeDossierFactory");
        const nodeDossierFactory = new NodeDossierFactory({});
        this.registerRepresentation(builtinDSURepr.NODE_DOSSIER, nodeDossierFactory);
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {string} representation
     * @return {boolean}
     */
    this.isValidRepresentation = (representation) => {
        return typeof factories[representation] !== 'undefined';
    };

    /**
     * @param {string} representation
     * @param {object} factory
     */
    this.registerRepresentation = (representation, factory) => {
        factories[representation] = factory;
    }

    /**
     * @param {string} representation
     * @param {object} dsuConfiguration
     * @param {callback} callback
     */
    this.create = (representation, dsuConfiguration, callback) => {
        const factory = factories[representation];
        factory.create(dsuConfiguration, callback);
    }

    /**
     * @param {string} did
     * @param {string} representation
     * @param {object} dsuConfiguration
     * @param {callback} callback
     */
    this.load = (did, representation, dsuConfiguration, callback) => {
        const factory = factories[representation];
        return factory.load(did, dsuConfiguration, callback);
    }

    initialize();
}

module.exports = Factory;
