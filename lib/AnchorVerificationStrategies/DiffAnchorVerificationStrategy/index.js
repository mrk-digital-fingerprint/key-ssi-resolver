'use strict';

const BarMapDiff = require('bar').BarMapDiff;
const SessionBarMap = require('./SessionBarMap');

function DiffAnchorVerificationStrategy(options) {
    options = options || {};

    let barMapController;
    let sessionBarMap = null;

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * Assemble a final BarMap from several BarMapDiffs
     *
     * @param {Array<string>} hashes
     * @param {callback} callback
     */
    const assembleBarMap = (hashes, callback) => {
        barMapController.getMultipleBricks(hashes, (err, bricks) => {
            if (err) {
                return callback(err);
            }

            if (hashes.length !== bricks.length) {
                return callback(new Error('Invalid data received'));
            }

            const barMap = barMapController.createNewBarMap();
            try {
                for (const brick of bricks) {
                    const barMapDiff = barMapController.createNewBarMap(brick);
                    barMap.applyDiff(barMapDiff);
                }
            } catch (e) {
                return callback(e);
            }

            callback(undefined, barMap);
        })
    }

    /**
     * @param {BarMapController} controller
     */
    this.setBarMapController = (controller) => {
        barMapController = controller;
    }

    /**
     * Load and assemble the BarMap identified by `alias`
     *
     * @param {callback} callback
     */
    this.loadBarMap = (callback) => {
        const alias = barMapController.getBarMapAlias();
        barMapController.getAliasVersions(alias, (err, versionHashes) => {
            if (err) {
                return callback(err);
            }

            if (!versionHashes.length) {
                return callback(new Error(`No data found for alias <${id}>`));
            };

            assembleBarMap(versionHashes, callback);
        });
    }

    /**
     * @return {SessionBarMap}
     */
    this.beginSession = () => {
        const diffBarMap = new BarMapDiff();
        barMapController.configureBarMap(diffBarMap);

        const currentBarMap = barMapController.getCurrentBarMap().clone();
        sessionBarMap = new SessionBarMap({
            currentBarMap,
            diffBarMap
        });
        return sessionBarMap;
    }

    /**
     * @return {boolean}
     */
    this.sessionIsStarted = () => {
        return sessionBarMap !== null;
    }

    this.endSession = () => {
        sessionBarMap = null;
    }

    /**
     * @param {string} operation
     * @param {string} path
     * @param {object} options
     * @param {callback} callback
     */
    this.validatePreWrite = (operation, path, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        callback();
    }

    /**
     * @param {BarMapDiff} diff
     * @param {string} diffHash
     * @param {callback} callback
     */
    this.afterBarMapUpdate = (diff, diffHash, callback) => {
        callback();
    }

    /**
     * Anchor BarMap changes
     * @param {callback} callback
     */
    this.doAnchoring = (callback) => {
        const diffBarMap = sessionBarMap.getDiff();

        barMapController.saveBarMap(diffBarMap, (err, hash) => {
            if (err) {
                return callback(err);
            }

            // Apply diff to current bar map
            const currentBarMap = barMapController.getCurrentBarMap();
            try {
                currentBarMap.applyDiff(diffBarMap);
            } catch (e) {
                return callback(e);
            }

            // Anchor the diff
            const alias = barMapController.getBarMapAlias();
            barMapController.updateAlias(alias, hash, (err) => {
                if (err) {
                    return callback(err);
                }

                this.afterBarMapUpdate(diffBarMap, hash, (err) => {
                    if (err) {
                        return callback(err);
                    }

                    this.endSession();
                    const result = {
                        sessionEnded: true,
                        hash
                    };
                    callback(undefined, result);
                })
            });
        })
    }
}

module.exports = DiffAnchorVerificationStrategy;
