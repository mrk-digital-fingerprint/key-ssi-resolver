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
    let lastHash;


    ////////////////////////////////////////////////////////////
    // Public methods
    ////////////////////////////////////////////////////////////
    /**
     * Assemble a final BarMap from a Brick
     *
     * @param {Array<string>} hashes
     * @param {callback} callback
     */
    this.assembleBarMap = (hashes, callback) => {
        const barMapBrickId = hashes[hashes.length - 1];
        lastHash = barMapBrickId;
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
     * @return {SessionBarMap}
     */
    this.beginSession = () => {
        this.sessionInProgress = true;

        if (!sessionBarMap) {
            sessionBarMap = this.barMapController.getCurrentBarMap();
        }
        return sessionBarMap;
    }

    /**
     * @return {BarMap}
     */
    this.endSession = () => {
        this.sessionInProgress = false;
        return sessionBarMap.clone();
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

            sessionBarMap = this.barMapController.getCurrentBarMap();
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
     * @param {BarMap} barMap
     * @param {string} hash
     * @param {callback} callback
     */
    this.afterBarMapUpdate = (barMap, hash, callback) => {
        callback(undefined, hash);
    }

    this.initialize(options);
}

module.exports = VersionedStrategy;
