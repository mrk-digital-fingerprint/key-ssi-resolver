'use strict';

const BarMapDiff = require('bar').BarMapDiff;
const SessionBarMap = require('./SessionBarMap');
const AnchoringStrategyMixin = require('../AnchoringStrategyMixin');

function DiffStrategy(options) {
    Object.assign(this, AnchoringStrategyMixin);
    options = options || {};

    let barMapController;
    let sessionBarMap = null;
    let lastHash;
    const ALIAS_SYNC_ERR_CODE = 428;

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

            const validBarMap = barMapController.createNewBarMap();
            try {
                for (const brick of bricks) {
                    const barMapDiff = barMapController.createNewBarMap(brick);
                    validBarMap.applyDiff(barMapDiff);
                }
            } catch (e) {
                return callback(e);
            }

            callback(undefined, validBarMap);
        })
    }

    /**
     * 
     * @param {BarMapDiff} diffBarMap 
     * @param {callback} callback 
     */
    const handleAnchoringConflict = (diffBarMap, diffBarMapHash, callback) => {
        // TODO: retry anchoring
        // TODO: apply diff

        this.loadBarMap((err, barMap) => {
            if (err) {
                return callback(err);
            }

            const alias = barMapController.getBarMapAlias();

            barMapController.updateAlias(alias, diffBarMapHash, lastHash, (err) => {
                if (err) {
                    return callback(err);
                }

                // todo: update alias and check if its the latest version
                // if it is, go ahead and apply the diff
                const currentBarMap = barMapController.getCurrentBarMap();
                try {
                    currentBarMap.applyDiff(diffBarMap);
                } catch (e) {
                    return callback(e);
                }
                lastHash = diffBarMapHash;

                this.afterBarMapUpdate(diffBarMap, diffBarMapHash, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    const result = {
                        sessionEnded: true,
                        diffBarMapHash
                    };
                    callback(undefined, result);
                })
            });
        });
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

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
                return callback(new Error(`No data found for alias <${alias}>`));
            };

            lastHash = versionHashes[versionHashes.length - 1];

            assembleBarMap(versionHashes, callback);
        });
    }

    /**
     * @return {SessionBarMap}
     */
    this.beginSession = () => {
        const diffBarMap = new BarMapDiff({
            prevDiffHash: lastHash
        });
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
        this.endSession();

        const alias = barMapController.getBarMapAlias();

        barMapController.saveBarMap(diffBarMap, (err, hash) => {
            if (err) {
                return callback(err);
            }

            // todo: apply the diff on a clone and check the result

            // Anchor the diff
            barMapController.updateAlias(alias, hash, lastHash, (err) => {
                if (err) {
                    if (err.statusCode === ALIAS_SYNC_ERR_CODE) {
                        // if it's not the latest version, run default reconciliation strategy (reload the barMap and apply the diff)
                        // run the reconciliation strategy, apply the diff on the resulting strategy
                        return handleAnchoringConflict(diffBarMap, hash, callback);

                    }
                    return callback(err);
                }

                // todo: update alias and check if its the latest version
                // if it is, go ahead and apply the diff
                const currentBarMap = barMapController.getCurrentBarMap();
                try {
                    currentBarMap.applyDiff(diffBarMap);
                } catch (e) {
                    return callback(e);
                }
                lastHash = hash;

                this.afterBarMapUpdate(diffBarMap, hash, (err) => {
                    if (err) {
                        return callback(err);
                    }
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

module.exports = DiffStrategy;
