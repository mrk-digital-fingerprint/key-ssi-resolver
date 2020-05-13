'use strict';

function RequestsPipeline() {
    const next = (err, next) => {
        if (err) {
            return next(err);
        }

        return next();
    }

    this.addStep = (obj, method) => {
        const stepFunction = (...args) => {
            const callback = args.pop();

            args.push((err, data) => {
                if (err) {
                    return nextStep();
                }
            });

            obj.method.apply(obj, args)
        }

    }

    this.execute = (argument, callback) => {

    }

}

module.exports = RequestsPipeline;
