'use strict';

function SimpleAnchorVerificationStrategy(options) {
    options = options || {};

    this.beginSession = (bar) => {

    }

    this.validatePreWrite = (path, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        callback();
    }

    this.afterBarMapUpdate = (diffBarMap) => {

    }

    this.doAnchoring = (callback) => {

    }
}

module.exports = SimpleAnchorVerificationStrategy;
