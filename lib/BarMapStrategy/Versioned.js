'use strict';

const bar = require('bar');
const BarMapStrategyMixin = require('./BarMapStrategyMixin');

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
function VersionedStrategy(options) {
    options = options || {};
    Object.assign(this, BarMapStrategyMixin);

    let sessionBarMap = null;
    let sessionInProgress = false;
    let anchoringInProgress = false;

    if (typeof options.anchoringCb === 'function') {
        this.setAnchoringCallback(options.anchoringCb);
    }

    if (typeof options.decisionFn === 'function') {
        this.setDecisionFunction(options.decisionFn);
    }

    if (typeof options.signingFn === 'function') {
        this.setSigningFunction(options.signingFn);
    }

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * Assemble a final BarMap from a Brick
     *
     * @param {Array<string>} hashes
     * @param {callback} callback
     */
    const assembleBarMap = (barMapBrickId, callback) => {
        this.barMapController.getBrick(barMapBrickId, (err, brick) => {
            if (err) {
                return callback(err);
            }

            if (barMapBrickId !== brick.getHash()) {
                return callback(new Error('Invalid data received'));
            }

            const barMap = bar.createBarMap(brick);
            this.barMapController.configureBarMap(barMap);
            callback(undefined, barMap);
        })
    }

    /**
     * 
     * @param {BarMapDiff} diffBarMap 
     * @param {string} diffHash 
     * @param {callback} callback 
     */
    const postUpdateAlias = (diffBarMap, diffHash, callback) => {
        this.afterBarMapUpdate(diffBarMap, diffHash, (err) => {
            if (err) {
                return callback(err);
            }
            callback(undefined, diffHash);
        })
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

            const barMapBrickId = versionHashes[versionHashes.length - 1];
            assembleBarMap(barMapBrickId, callback);
        });
    }

    /**
     * @return {SessionBarMap}
     */
    this.beginSession = () => {
        sessionInProgress = true;

        if (!sessionBarMap) {
            sessionBarMap = this.barMapController.getCurrentBarMap();
        }
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
     * Anchor each change
     * 
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
        const sessBarMap = sessionBarMap;
        const alias = this.barMapController.getBarMapAlias();
        const barMapBrick = sessBarMap.toBrick();
        barMapBrick.setTransformParameters(sessBarMap.getTransformParameters());
        endSession();

        this.barMapController.saveBarMap(barMapBrick, (err, hash) => {
            if (err) {
                return callback(err);
            }

            this.barMapController.updateAlias(alias, hash, (err) => {
                if (err) {
                    if (err.statusCode === this.ALIAS_SYNC_ERR_CODE) {
                        // BarMap is out of sync 
                        return handleAnchoringConflict(diffBarMap, hash, callback);

                    }
                    return callback(err);
                }

                postUpdateAlias(sessBarMap, hash, callback);
            })
        })
    }
}

module.exports = VersionedStrategy;
