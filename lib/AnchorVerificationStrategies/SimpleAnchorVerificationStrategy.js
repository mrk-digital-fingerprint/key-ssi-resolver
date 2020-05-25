'use strict';

function SimpleAnchorVerificationStrategy(options) {
    options = options || {};

    this.barMap = null;

    this.beginSession = (barMap) => {
        this.barMap = barMap;
        return this.barMap;
    }

    this.sessionIsStarted = () => {
        return this.barMap !== null;
    }

    this.endSession = () => {
        this.barMap = null;
    }

    this.validatePreWrite = (operation, path, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        callback();
    }

    this.afterBarMapUpdate = (diffBarMap, callback) => {
        callback();
    }

    /**
     * Anchor each change
     * @param {callback} callback
     */
    this.doAnchoring = (callback) => {
        this.barMap.saveChanges((err, result) => {
            if (err) {
                return callback(err);
            }

            this.afterBarMapUpdate(result.diffBarMap, (err) => {
                if (err) {
                    return callback(err);
                }

                this.endSession();

                const anchoringResult = {
                    status: true,
                    hash: result.hash
                }
                callback(undefined, anchoringResult);
            });
        })
    }
}

module.exports = SimpleAnchorVerificationStrategy;
