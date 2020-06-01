'use strict';

const bar = require('bar');
const AnchoringStrategyMixin = require('./AnchoringStrategyMixin');

function VersionedStrategy(options) {
    options = options || {};
    Object.assign(this, AnchoringStrategyMixin);

    let sessionBarMap = null;

    if (typeof options.anchoringCb === 'function') {
        this.setAnchoringCallback(options.anchoringCb);
    }

    if (typeof options.decisionCb === 'function') {
        this.setDecisionCallback(options.decisionCb);
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
     * @param {Brick} barMapBrick
     * @param {callback} callback
     */
    const anchorBarMapVersion = (barMapBrick, callback) => {
        const alias = this.barMapController.getBarMapAlias();
        const barMapHash = barMapBrick.getHash();

        this.barMapController.updateAlias(alias, barMapHash, (err) => {
            if (err) {
                return callback(err);
            }

            this.barMapController.saveBarMap(barMapBrick, (err, hash) => {
                if (err) {
                    return callback(err);
                }

                this.afterBarMapUpdate(sessionBarMap, hash, (err) => {
                    if (err) {
                        return callback(err);
                    }

                    callback(undefined, hash);
                });
            })
        })
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
        sessionBarMap = this.barMapController.getCurrentBarMap();
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
     * Anchor each change
     * 
     * @param {callback} callback
     */
    this.doAnchoring = (callback) => {
        this.ifChangesShouldBeAnchored(sessionBarMap, (result) => {
            if (!result) {
                return callback();
            }
            const sessBarMap = sessionBarMap;
            this.endSession();

            let anchoringCallback = this.anchoringCallback;
            if (typeof anchoringCallback !== 'function') {
                anchoringCallback = callback;
            } else {
                callback();
            }

            const alias = this.barMapController.getBarMapAlias();
            const barMapBrick = sessBarMap.toBrick();
            barMapBrick.setTransformParameters(sessBarMap.getTransformParameters());

            this.barMapController.getAliasVersions(alias, (err, versionHashes) => {
                if (err) {
                    return anchoringCallback(err);
                }

                const latestVersion = versionHashes[versionHashes.length - 1];

                // No changes detected
                if (latestVersion === barMapBrick.getHash()) {
                    return anchoringCallback(undefined, latestVersion);
                }

                anchorBarMapVersion(barMapBrick, anchoringCallback);
            })
        });
    }
}

module.exports = VersionedStrategy;
