'use strict';

const BarMapDiff = require('bar').BarMapDiff;
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
function DiffStrategy(options) {
    options = options || {};
    Object.assign(this, BarMapStrategyMixin);

    ////////////////////////////////////////////////////////////
    // Private methods
    ////////////////////////////////////////////////////////////

    /**
     * 
     * @param {Array<BarMapDiff} barMapDiffs 
     * @param {callback} callback 
     */
    const createBarMapFromDiffs = (barMapDiffs, callback) => {
        const barMap = this.barMapController.createNewBarMap();
        try {
            for (const barMapDiff of barMapDiffs) {
                barMap.applyDiff(barMapDiff);
            }
        } catch (e) {
            return callback(e);
        }

        callback(undefined, barMap);
    }

    /**
     * @param {Array<Brick>} bricks
     * @return {Array<BarMapDiff}
     */
    const createDiffsFromBricks = (bricks) => {
        const diffs = [];
        for (const brick of bricks) {
            const barMap = this.barMapController.createNewBarMap(brick);
            diffs.push(barMap);
        }

        return diffs;
    }

    /**
     * Assemble a final BarMap from several BarMapDiffs
     *
     * @param {Array<string>} hashes
     * @param {callback} callback
     */
    const assembleBarMap = (hashes, callback) => {
        this.lastHash = hashes[hashes.length - 1];

        this.barMapController.getMultipleBricks(hashes, (err, bricks) => {
            if (err) {
                return callback(err);
            }

            if (hashes.length !== bricks.length) {
                return callback(new Error('Invalid data received'));
            }

            const barMapDiffs = createDiffsFromBricks(bricks);
            this.validator.validate('barMapHistory', barMapDiffs, (err) => {
                if (err) {
                    return callback(err);
                }

                createBarMapFromDiffs(barMapDiffs, callback);
            });
        })
    }


    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////

    this.load = (alias, callback) => {
        this.barMapController.getAliasVersions(alias, (err, versionHashes) => {
            if (err) {
                return callback(err);
            }

            if (!versionHashes.length) {
                return callback(new Error(`No data found for alias <${alias}>`));
            }

            assembleBarMap(versionHashes, callback);
        })
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

            const currentBarMapClone = this.barMapController.getValidBarMap().clone();
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
     * @param {Array<BarMapDiff} pendingAnchoringDiffs
     * @param {Array<BarMapDiff} compactedDiffs
     * @return {BarMapDiff}
     */
    this.compactDiffs = (pendingAnchoringDiffs, compactedDiffs) => {
        const barMap = pendingAnchoringDiffs.shift();
        compactedDiffs.push(barMap.clone());

        while (pendingAnchoringDiffs.length) {
            const barMapDiff = pendingAnchoringDiffs.shift();

            compactedDiffs.push(barMapDiff);
            barMap.applyDiff(barMapDiff);
        }

        return barMap;
    }

    /**
     * @param {BarMapDiff} diff
     * @param {string} diffHash
     * @param {callback} callback
     */
    this.afterBarMapAnchoring = (diff, diffHash, callback) => {
        const validBarMap = this.barMapController.getValidBarMap();
        try {
            validBarMap.applyDiff(diff);
        } catch (e) {
            return callback(e);
        }
        this.lastHash = diffHash;
        callback(undefined, diffHash);
    }

    this.handleConflict = (conflictInfo, callback) => {
        if (typeof this.conflictResolutionFn !== 'function') {
            return callback(conflictInfo.error);
        }

        this.conflictResolutionFn(this.barMapController, {
            validBarMap: conflictInfo.barMap,
            compactedDiffs: conflictInfo.compactedDiffs,
            pendingAnchoringDiffs: conflictInfo.pendingAnchoringDiffs,
            newDiffs: conflictInfo.newDiffs,
            error: conflictInfo.error
        }, callback);
    }

    this.reconcile = (barMap, compactedDiffs, pendingAnchoringDiffs, newDiffs, callback) => {
        // Try and apply the changes on a barMap copy
        const barMapCopy = barMap.clone();

        try {
            for (let i = 0; i < compactedDiffs.length; i++) {
                barMapCopy.applyDiff(compactedDiffs[i]);
            }

            for (let i = 0; i < pendingAnchoringDiffs; i++) {
                barMapCopy.applyDiff(pendingAnchoringDiffs[i]);
            }
        } catch (e) {
            return this.handleConflict({
                barMap,
                compactedDiffs,
                pendingAnchoringDiffs,
                newDiffs,
                error: e
            }, callback);
        }

        // Move the compacted diffs back to pending state
        while (compactedDiffs.length) {
            const diff = compactedDiffs.shift();
            pendingAnchoringDiffs.push(diff);
        }

        this.barMapController.setDirtyBarMap(barMapCopy);
        callback();
    }

    this.initialize(options);
}

module.exports = DiffStrategy;