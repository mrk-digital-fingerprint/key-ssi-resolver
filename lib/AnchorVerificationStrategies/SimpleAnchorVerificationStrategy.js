'use strict';

function SimpleAnchorVerificationStrategy(options) {
    options = options || {};

    this.bar = null;
    this.anchoringExecutor = null;

    this.beginSession = (bar) => {
        this.bar = bar;
    }

    this.sessionIsStarted = () => {
        return this.bar !== null;
    }

    this.endSession = () => {
        this.bar = null;
    }

    this.validatePreWrite = (path, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        callback();
    }

    this.setAnchoringExecutor = (callback) => {
        this.anchoringExecutor = callback;
    }

    this.afterBarMapUpdate = (diffBarMap, callback) => {
        callback();
    }

    /**
     * Anchor each change
     * @param {callback} callback
     */
    this.doAnchoring = (callback) => {
        if (!this.anchoringExecutor) {
            return callback(new Error('The anchoring executor is missing'));
        }

        this.anchoringExecutor((err, result) => {
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
