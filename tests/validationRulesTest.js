'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const dsuRepresentations = constants.builtinDSURepr;
const barMapStrategies = constants.builtinBarMapStrategies;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'validation_rules_test', testName: 'Validation Rules Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint

    runTest(result.doneCallback);
});

function runTest(callback) {

    keyDidResolver.createDSU(dsuRepresentations.BAR, {
        favouriteEndpoint,
        validationRules: {
            preWrite: {
                /**
                 * @param {BarMap} A dirty copy of the valid BarMap
                 * @param {string} The write operation (addFile, delete, copy, etc...)
                 * @param {string} The BarMap path to write in
                 * @param {object} Corresponding write data. Ex: brick hashes for the write operation
                 * @param {callback} callback
                 */
                validate: (dirtyBarMap, operation, barMapPath, data, callback) => {
                    console.log(operation, barMapPath, data);
                    // Assume all writes are valid
                    return callback();
                }
            }
        }
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        dsu.writeFile('/test', 'file content', (err) => {
            assert.true(typeof err === 'undefined', 'DSU is writable');

            loadDSU(dsu.getDID(), callback);
        });
    });
}

function loadDSU(did, callback) {
    keyDidResolver.loadDSU(did, dsuRepresentations.BAR, {
        validationRules: {
            barMapHistory: {
                /**
                 * @param {Array<BarMap>} A list of BarMap diffs that make up a valid BarMap
                 * @param {callback} callback
                 */
                validate: (barMapDiffs, callback) => {
                    console.log('BarMap History', barMapDiffs);
                    // Assume history is invalid
                    return callback(new Error('BarMap history is invalid'));
                }
            }
        }
    }, (err) => {
        assert.true(typeof err !== 'undefined', "DSU cannot be loaded");
        assert.true(err.message === 'BarMap history is invalid');
        callback();
    })

}