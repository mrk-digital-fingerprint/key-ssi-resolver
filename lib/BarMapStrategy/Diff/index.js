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

    let sessionBarMap = null;
    let lastHash;
    let lastDiffHash;

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * @return {SessionBarMap}
     */
    const createSessionBarMap = () => {
        const diffBarMap = new BarMapDiff({
            prevDiffHash: lastDiffHash
        });
        this.barMapController.configureBarMap(diffBarMap);

        const currentBarMapClone = this.barMapController.getCurrentBarMap().clone();
        sessionBarMap = new SessionBarMap({
            currentBarMapClone,
            diffBarMap
        });
        return sessionBarMap;
    }


    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    /**
     * Assemble a final BarMap from several BarMapDiffs
     *
     * @param {Array<string>} hashes
     * @param {callback} callback
     */
    this.assembleBarMap = (hashes, callback) => {
        lastHash = hashes[hashes.length - 1];
        lastDiffHash = lastHash;

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
     * @return {SessionBarMap}
     */
    this.beginSession = () => {
        this.sessionInProgress = true;

        if (!sessionBarMap) {
            sessionBarMap = createSessionBarMap();
            return sessionBarMap;
        }

        const diffBarMap = new BarMapDiff({
            prevDiffHash: lastDiffHash
        });
        this.barMapController.configureBarMap(diffBarMap);
        sessionBarMap.registerDiff(diffBarMap);
        return sessionBarMap;
    }

    /**
     * @return {BarMapDiff}
     */
    this.endSession = () => {
        this.sessionInProgress = false;

        const diffBarMap = sessionBarMap.getCurrentDiff();
        const barMapBrick = diffBarMap.toBrick();
        barMapBrick.setTransformParameters(diffBarMap.getTransformParameters());
        lastDiffHash = barMapBrick.getHash();

        return diffBarMap;
    }

    /**
     * @param {callback} callback
     * @return {function}
     */
    this.getResolutionCallback = (callback) => {
        return (err) => {
            if (err) {
                return callback(err);
            }

            const currentBarMapClone = this.barMapController.getCurrentBarMap().clone();
            sessionBarMap.setCurrentBarMapClone(currentBarMapClone);
            try {
                sessionBarMap.applyDiffsStartingWith(diffBarMap);
            } catch (e) {
                return callback(err);
            }

            return callback();
        };
    }

    /**
     * @return {string}
     */
    this.getLastHash = () => {
        return lastHash;
    }

    /**
     * @param {BarMapDiff} diff
     * @param {string} diffHash
     * @param {callback} callback
     */
    this.afterBarMapUpdate = (diff, diffHash, callback) => {
        const currentBarMap = this.barMapController.getCurrentBarMap();
        try {
            currentBarMap.applyDiff(diff);
        } catch (e) {
            return callback(e);
        }
        lastHash = diffHash;
        // TODO: cleanup SessionBarMap, remove anchored diffs
        callback(undefined, diffHash);
    }

    this.initialize(options);
}

module.exports = DiffStrategy;