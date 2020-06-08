'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const dsuRepresentations = constants.builtinDSURepr;
const barMapStrategies = constants.builtinBarMapStrategies;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'anchoring_options_test', testName: 'Anchoring Options Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint

    runTest(result.doneCallback);
});

function runTest(callback) {

    keyDidResolver.createDSU(dsuRepresentations.BAR, {
        favouriteEndpoint,
        barMapStrategy: barMapStrategies.DIFF,
        anchoringOptions: {
            /**
             * @param {BarMap} sessionBarMap A dirty copy of the current valid BarMap containing all changes (valid & un-anchored)
             * @param {callback} callback Calling the callback with the second parameter true, tells the BarMapController to anchor the changes
             */
            decisionFn: (sessionBarMap, callback) => {
                const anchorChanges = true;
                callback(undefined, anchorChanges);
            },

            /**
             * @param {BarMapController} barMapController
             * @param {object} conflictInfo
             * @param {BarMap} conflictInfo.validBarMap A valid barMap containing the latest changes
             * @param {Array<BarMapDiff>} conflictInfo.pendingAnchoringDiffs A reference to the list of BarMapDiff objects containing all the changes proposed for anchoring
             * @param {Arrat<BarMapDiff>} conflictInfo.newDiffs A reference to the list of new BarMapDiff objects which haven't been yet proposed for anchoring
             * @param {Error|*} conflictInfo.error The error which occurred while trying to merge the un-anchored changes into the latest valid barmap
             * @param {callback} callback
             */
            conflictResolutionFn: (barMapController, conflictInfo, callback) => {
                // This function must use the conflictInfo object to fix 
                // the merging conflicts, apply the new changes from the pendingAnchoringDiffs and newDiffs and update the valid bar map and the dirty bar map clone
                // using the barMapController, then call the callback to resume the anchoring process

                // If fixing the conflict fails, the `callback` must be called with an error
                // to abort the anchoring process.
            },

            /**
             * @param {Error} err
             * @param {string|undefined} anchoredBarMapLatestHash
             */
            anchoringEventListener: (err, anchoredBarMapLatestHash) => {
                if (err) {
                    // See `bar.constants.anchoringStatus` for a list
                    // of anchoring error types
                    console.log(err.type);
                    return;
                }

                console.log(anchoredBarMapLatestHash);
                callback();
            }
        }
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        dsu.writeFile('/test', 'file content', (err) => {
            assert.true(typeof err === 'undefined', 'DSU is writable');
        });
    });
}