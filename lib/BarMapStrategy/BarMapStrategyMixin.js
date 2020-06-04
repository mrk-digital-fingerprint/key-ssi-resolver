'use strict';

const BarMapStrategyMixin = {
    ALIAS_SYNC_ERR_CODE: 428,
    barMapController: null,
    anchoringCallback: null,
    decisionFunction: null,
    signingFunction: null,

    /**
     * @param {BarMapController} controller
     */
    setBarMapController: function (controller) {
        this.barMapController = controller;
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

    beginSession: function () {
        throw new Error('Unimplemented');
    },

    sessionIsStarted: function () {
        throw new Error('Unimplemented');
    },

    endSession: function () {
        throw new Error('Unimplemented');
    },

    afterBarMapUpdate: function (diff, diffHash, callback) {
        throw new Error('Unimplemented');
    },

    attemptAnchoring: function (callback) {
        throw new Error('Unimplemented');
    },

    anchorChanges: function (callback) {
        throw new Error('Unimplemented');
    }
}

module.exports = BarMapStrategyMixin;