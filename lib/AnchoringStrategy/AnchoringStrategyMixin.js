'use strict';

const AnchorStrategyMixin = {
    ALIAS_SYNC_ERR_CODE: 428,
    barMapController: null,
    anchoringCallback: null,
    decisionCallback: null,

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
     * 
     * @param {callback} callback 
     */
    setDecisionCallback: function (callback) {
        this.decisionCallback = callback;
    },

    /**
     * 
     * @param {BarMap} barMap 
     * @param {callback} callback 
     */
    ifChangesShouldBeAnchored: function (barMap, callback) {
        if (typeof this.decisionCallback !== 'function') {
            return callback(true);
        }

        this.decisionCallback(barMap, callback);
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

    doAnchoring: function (callback) {
        throw new Error('Unimplemented');
    }
}

module.exports = AnchorStrategyMixin;