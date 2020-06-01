'use strict';

const BarMapDiff = require('bar').BarMapDiff;
const SessionBarMap = require('./SessionBarMap');
const AnchoringStrategyMixin = require('../AnchoringStrategyMixin');

function DiffStrategy(options) {
    options = options || {};
    Object.assign(this, AnchoringStrategyMixin);

    let conflictResolutionCallback = null;
    let sessionBarMap = null;
    let lastHash;

    if (typeof options.anchoringCb === 'function') {
        this.setAnchoringCallback(options.anchoringCb);
    }

    if (typeof options.decisionCb === 'function') {
        this.setDecisionCallback(options.decisionCb);
    }

    if (typeof options.conflictResolutionCb === 'function') {
        this.setConflictResolutionCallback(options.conflictResolutionCb);
    }

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
        this.barMapController.getMultipleBricks(hashes, (err, bricks) => {
            if (err) {
                return callback(err);
            }

            if (hashes.length !== bricks.length) {
                return callback(new Error('Invalid data received'));
            }

            const validBarMap = this.barMapController.createNewBarMap();
            try {
                for (const brick of bricks) {
                    const barMapDiff = this.barMapController.createNewBarMap(brick);
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
     * @param {string} diffHash 
     * @param {callback} callback 
     */
    const postUpdateAlias = (diffBarMap, diffHash, callback) => {
        const currentBarMap = this.barMapController.getCurrentBarMap();
        try {
            currentBarMap.applyDiff(diffBarMap);
        } catch (e) {
            return callback(e);
        }
        lastHash = diffHash;

        this.afterBarMapUpdate(diffBarMap, diffHash, (err) => {
            if (err) {
                return callback(err);
            }
            callback(undefined, diffHash);
        })
    }

    /**
     * 
     * @param {BarMapDiff} diffBarMap 
     * @param {string} diffBarMapHash 
     * @param {callback} callback 
     */
    const resolveAnchoringConflict = (diffBarMap, diffBarMapHash, callback) => {
        if (typeof conflictResolutionCallback !== 'function') {
            // Default strategy is to reload the BarMap
            return this.loadBarMap(callback);
        }

        conflictResolutionCallback(this.barMapController, {
            barMapAlias: this.barMapController.getBarMapAlias(),
            oldBarMap: this.barMapController.getCurrentBarMap(),
            diffBarMap,
            diffBarMapHash
        }, callback);
    }

    /**
     * 
     * @param {BarMapDiff} diffBarMap 
     * @param {callback} callback 
     */
    const handleAnchoringConflict = (diffBarMap, diffBarMapHash, callback) => {
        resolveAnchoringConflict(diffBarMap, diffBarMapHash, (err) => {
            if (err) {
                return callback(err);
            }

            const alias = this.barMapController.getBarMapAlias();

            this.barMapController.updateAlias(alias, diffBarMapHash, lastHash, (err) => {
                if (err) {
                    return callback(err);
                }

                postUpdateAlias(diffBarMap, diffBarMapHash, callback);
            });
        })
        this.loadBarMap((err) => {
            if (err) {
                return callback(err);
            }

        });
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {callback} callback
     */
    this.setConflictResolutionCallback = (callback) => {
        conflictResolutionCallback = callback;
    }

    /**
     * Load and assemble the BarMap identified by `alias`
     *
     * @param {callback} callback
     */
    this.loadBarMap = (callback) => {
        const alias = this.barMapController.getBarMapAlias();
        this.barMapController.getAliasVersions(alias, (err, versionHashes) => {
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
        this.barMapController.configureBarMap(diffBarMap);

        const currentBarMap = this.barMapController.getCurrentBarMap().clone();
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
        this.ifChangesShouldBeAnchored(sessionBarMap, (result) => {
            if (!result) {
                return callback();
            }
            const diffBarMap = sessionBarMap.getDiff();
            this.endSession();

            let anchoringCallback = this.anchoringCallback;
            if (typeof anchoringCallback !== 'function') {
                anchoringCallback = callback;
            } else {
                callback();
            }

            const alias = this.barMapController.getBarMapAlias();

            this.barMapController.saveBarMap(diffBarMap, (err, hash) => {
                if (err) {
                    return anchoringCallback(err);
                }

                // Anchor the diff
                this.barMapController.updateAlias(alias, hash, lastHash, (err) => {
                    if (err) {
                        if (err.statusCode === this.ALIAS_SYNC_ERR_CODE) {
                            // if it's not the latest version, run default reconciliation strategy (reload the barMap and apply the diff)
                            // run the reconciliation strategy, apply the diff on the resulting strategy
                            return handleAnchoringConflict(diffBarMap, hash, anchoringCallback);

                        }
                        return anchoringCallback(err);
                    }

                    postUpdateAlias(diffBarMap, hash, anchoringCallback);
                });
            })
        });
    }
}

module.exports = DiffStrategy;
