'use strict';

/**
 * @param {object} options
 * @param {BootstrapingService} options.bootstrapingService
 * @param {string} options.dlDomain
 * @param {DIDFactory} options.didFactory
 * @param {AnchorVerificationStrategyFactory} options.anchorVerificationStrategyFactory
 */
function NodeDossierFactory(options) {
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
        return callback(new Error("Wrong usage of create function. NodeDossier representation is just for loading and interacting purpose."));
    }

    /**
     * @param {string} did
     * @param {object} options
     * @param {callback} callback
     */
    this.load = (did, options, callback) => {

        const envTypes = require("overwrite-require").constants;
        if($$.environmentType !== envTypes.NODEJS_ENVIRONMENT_TYPE){
            return callback(new Error(`NodeDossier representation should be used only in NodeJS. Current environment type is <${$$.environmentType}>`));
        }

        options = options || {};
        let didInstance;

        try {
            didInstance = restoreDID(did);
        } catch (e) {
            return callback(e);
        }

        const pathName = "path";
        const path = require(pathName);
        const powerCord = new se.OuterThreadPowerCord(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, "psknode/bundles/threadBoot.js"), false, seed);
        let InteractionBase = require("./InteractionBase");
        InteractionBase.createHandler(did, powerCord, callback);
    }
}

module.exports = NodeDossierFactory;
