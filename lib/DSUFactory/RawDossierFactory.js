'use strict';

const RawDossier = require('edfs').RawDossier;

/**
 * @param {object} options
 * @param {BarFactory} options.barFactory
 */
function RawDossierFactory(options) {
    options = options || {};
    this.barFactory = options.barFactory;

    /**
     * @param {object} options
     * @param {callback} callback
     */
    this.create = (options, callback) => {
        this.barFactory.create(options, (err, bar) => {
            if (err) {
                return callback(err);
            }

            const rawDossier = new RawDossier(bar);
            callback(undefined, rawDossier);
        })

    };

    /**
     * @param {string} did
     * @param {object} options
     * @param {callback} callback
     */
    this.load = (did, options, callback) => {
        this.barFactory.load(did, options, (err, bar) => {
            if (err) {
                return callback(err);
            }

            const rawDossier = new RawDossier(bar);
            callback(undefined, rawDossier);
        })

    };
}

module.exports = RawDossierFactory;
