'use strict';

const BarMapStrategyMixin = {
    ALIAS_SYNC_ERR_CODE: 428,
    barMapController: null,
    anchoringCallback: null,
    conflictResolutionFunction: null,
    decisionFunction: null,
    signingFunction: null,
    sessionInProgress: false,

    initialize: function (options) {
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
    },

    /**
     * @param {BarMapController} controller
     */
    setBarMapController: function (controller) {
        this.barMapController = controller;
    },

    /**
     * @param {callback} callback
     */
    setConflictResolutionFunction: function (fn) {
        this.conflictResolutionFunction = fn;
    },

    /**
     * 
     * @param {callback} callback 
     */
    setAnchoringCallback: function (callback) {
        this.anchoringCallback = callback;
    },

    /**
     * @param {callback} fn 
     */
    setSigningFunction: function (fn) {
        this.signingFunction = fn;
    },

    /**
     * @param {callback} fn 
     */
    setDecisionFunction: function (fn) {
        this.decisionFunction = fn;
    },

    /**
     * 
     * @param {BarMap} barMap 
     * @param {callback} callback 
     */
    ifChangesShouldBeAnchored: function (barMap, callback) {
        if (typeof this.decisionFunction !== 'function') {
            return callback(undefined, true);
        }

        this.decisionFunction(barMap, callback);
    },

    /**
     * 
     * @param {BarMap} BarMap 
     * @param {string} hash 
     * @param {callback} callback 
     */
    resolveAnchoringConflict: function (barMap, hash, callback) {
        if (typeof this.conflictResolutionFunction !== 'function') {
            // Default strategy is to reload the BarMap
            return this.barMapController.load(this.getResolutionCallback(callback));
        }

        this.conflictResolutionFunction(this.barMapController, {
            barMapAlias: this.barMapController.getBarMapAlias(),
            oldBarMap: this.barMapController.getCurrentBarMap(),
            barMap,
            hash
        }, this.getResolutionCallback(callback));
    },

    beginSession: function () {
        throw new Error('Unimplemented');
    },

    sessionIsStarted: function () {
        return this.sessionInProgress;
    },

    endSession: function () {
        throw new Error('Unimplemented');
    },

    afterBarMapUpdate: function (diff, diffHash, callback) {
        throw new Error('Unimplemented');
    },

    assembleBarMap: function (hashes, callback) {
        throw new Error('Unimplemented');
    },

    /**
     * @return {callback}
     */
    getAnchoringCallback: function (defaultCallback) {
        let anchoringCallback = this.anchoringCallback;
        if (typeof anchoringCallback !== 'function') {
            anchoringCallback = defaultCallback;
        }

        return anchoringCallback;
    }
}

module.exports = BarMapStrategyMixin;