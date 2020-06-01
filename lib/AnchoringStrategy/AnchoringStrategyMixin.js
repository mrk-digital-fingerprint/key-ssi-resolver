'use strict';

const AnchorStrategyMixin = {

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