'use strict';

const BarMapStrategyMixin = {
    ALIAS_SYNC_ERR_CODE: 428,
    barMapController: null,
    anchoringEventListener: null,
    conflictResolutionFunction: null,
    decisionFunction: null,
    signingFunction: null,
    lastHash: null,
    validator: null,

    initialize: function (options) {
        if (typeof options.anchoringEventListener === 'function') {
            this.setAnchoringEventListener(options.anchoringEventListener);
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
     * @param {callback} listener 
     */
    setAnchoringEventListener: function (listener) {
        this.anchoringEventListener = listener;
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
     * @param {object} validator 
     */
    setValidator: function (validator) {
        this.validator = validator;
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
     * @return {string|null}
     */
    getLastHash: function () {
        return this.lastHash;
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

    afterBarMapAnchoring: function (diff, diffHash, callback) {
        throw new Error('Unimplemented');
    },

    load: function (alias, callback) {
        throw new Error('Unimplemented');
    },

    /**
     * @param {callback} defaultListener
     * @return {callback}
     */
    getAnchoringEventListener: function (defaultListener) {
        let anchoringEventListener = this.anchoringEventListener;
        if (typeof anchoringEventListener !== 'function') {
            anchoringEventListener = defaultListener;
        }

        return anchoringEventListener;
    }
}

module.exports = BarMapStrategyMixin;