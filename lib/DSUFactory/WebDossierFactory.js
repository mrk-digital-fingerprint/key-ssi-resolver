'use strict';

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 * @param {DIDFactory} options.didFactory
 * @param {AnchoringStrategyFactory} options.anchoringStrategyFactory
 */
function WebDossierFactory(options) {
    options = options || {};
    this.didFactory = options.didFactory;

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////
    /**
     * @param {string} did
     * @return {BaseDID}
     */
    const restoreDID = (did) => {
        return this.didFactory.create(did);
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {object} options
     * @param {callback} callback
     */
    this.create = (options, callback) => {
        return callback(new Error("Wrong usage of create function. WebDossier representation is just for loading and interacting purpose."));
    }

    /**
     * @param {string} did
     * @param {object} options
     * @param {callback} callback
     */
    this.load = (did, options, callback) => {

        const envTypes = require("overwrite-require").constants;
        if($$.environmentType !== envTypes.BROWSER_ENVIRONMENT_TYPE){
            return callback(new Error(`WebDossier representation should be used only in browser. Current environment type is <${$$.environmentType}>`));
        }

        options = options || {};
        let didInstance;

        try {
            didInstance = restoreDID(did);
        } catch (e) {
            return callback(e);
        }

        let InteractionBase = require("./InteractionBase");
        const pc = new se.OuterWebWorkerPowerCord("path_to_boot_script", seed);
        InteractionBase.createHandler(did, pc, callback);
    }
}

module.exports = WebDossierFactory;
