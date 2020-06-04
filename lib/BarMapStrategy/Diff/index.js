'use strict';

const BarMapDiff = require('bar').BarMapDiff;
const SessionBarMap = require('./SessionBarMap');
const BarMapStrategyMixin = require('../BarMapStrategyMixin');

/**
 * @param {object} options
 * @param {callback} options.decisionFn Callback which will decide when to effectively anchor changes
 *                                                              If empty, the changes will be anchored after each operation
 * @param {callback} options.conflictResolutionFn Callback which will handle anchoring conflicts
 *                                                              The default strategy is to reload the BarMap and then apply the new changes
 * @param {callback} options.anchoringCb A callback which is called when the strategy anchors the changes
 * @param {callback} options.signingFn  A function which will sign the new alias
 * @param {callback} callback
 */
function DiffStrategy(options) {
    options = options || {};
    Object.assign(this, BarMapStrategyMixin);

    let conflictResolutionFunction = null;
    let sessionBarMap = null;
    let sessionInProgress = false;
    let anchoringInProgress = false;
    let lastHash;

    if (typeof options.anchoringCb === 'function') {
        this.setAnchoringCallback(options.anchoringCb);
    }

    if (typeof options.decisionFn === 'function') {
        this.setDecisionFunction(options.decisionFn);
    }

    if (typeof options.conflictResolutionFn === 'function') {
        this.setConflictResolutionFunction(options.conflictResolutionFn);
    }

    if (typeof options.signingFn === 'function') {
        this.setSigningFunction(options.signingFn);
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
        sessionBarMap.linkNewestDiff(diffBarMap, diffHash);

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
        if (typeof conflictResolutionFunction !== 'function') {
            // Default strategy is to reload the BarMap
            return this.loadBarMap(callback);
        }

        conflictResolutionFunction(this.barMapController, {
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

            const currentBarMapClone = this.barMapController.getCurrentBarMap().clone();
            sessionBarMap.setCurrentBarMap(currentBarMapClone);
            try {
                sessionBarMap.applyDiffsStartingWith(diffBarMap);
            } catch (e) {
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
    }

    /**
     * @return {SessionBarMap}
     */
    const createSessionBarMap = () => {
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

    const getAnchoringCallback = (defaultCallback) => {
        let anchoringCallback = this.anchoringCallback;
        if (typeof anchoringCallback !== 'function') {
            anchoringCallback = defaultCallback;
        }

        return anchoringCallback;
    }

    const endSession = () => {
        sessionInProgress = false;
    }

    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * @param {callback} callback
     */
    this.setConflictResolutionFunction = (callback) => {
        conflictResolutionFunction = callback;
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
        sessionInProgress = true;

        if (!sessionBarMap) {
            sessionBarMap = createSessionBarMap();
            return sessionBarMap;
        }

        const diffBarMap = new BarMapDiff();
        this.barMapController.configureBarMap(diffBarMap);
        sessionBarMap.registerDiff(diffBarMap);
        return sessionBarMap;
    }

    /**
     * @return {boolean}
     */
    this.sessionIsStarted = () => {
        return sessionInProgress;
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
     * Try an anchor the changes
     * @param {callback} callback
     */
    this.attemptAnchoring = (callback) => {
        this.ifChangesShouldBeAnchored(sessionBarMap, (err, result) => {
            if (err) {
                return callback(err);
            }

            if (!result) { // Changes will be anchored later
                return callback();
            }

            const anchoringCallback = getAnchoringCallback(callback);
            if (anchoringCallback !== callback) {
                // Resume execution and perform the anchoring in the background
                // When anchoring has been done the `anchoringCallback` will be called
                callback();
            }

            if (anchoringInProgress) {
                // TODO: implement an Anchoring Queue
                return callback(new Error('An anchoring operation is already in progress'));
            }

            anchoringInProgress = true;

            this.anchorChanges((err, result) => {
                anchoringInProgress = false;
                anchoringCallback(err, result);
            });
        });
    }

    this.anchorChanges = (callback) => {
        const alias = this.barMapController.getBarMapAlias();
        const diffBarMap = sessionBarMap.getCurrentDiff();
        const diffBarMapBrick = diffBarMap.toBrick();
        diffBarMapBrick.setTransformParameters(diffBarMap.getTransformParameters());
        endSession();

        this.barMapController.saveBarMap(diffBarMapBrick, (err, hash) => {
            if (err) {
                return callback(err);
            }

            // Anchor the diff
            this.barMapController.updateAlias(alias, hash, lastHash, (err) => {
                if (err) {
                    if (err.statusCode === this.ALIAS_SYNC_ERR_CODE) {
                        // BarMap is out of sync 
                        return handleAnchoringConflict(diffBarMap, hash, callback);

                    }
                    return callback(err);
                }

                postUpdateAlias(diffBarMap, hash, callback);
            });
        })
    }
}

module.exports = DiffStrategy;
