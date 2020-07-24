'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const dsuRepresentations = constants.builtinDSURepr;
const brickMapStrategies = constants.builtinBrickMapStrategies;

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
                 * @param {BrickMap} A dirty copy of the valid BrickMap
                 * @param {string} The write operation (addFile, delete, copy, etc...)
                 * @param {string} The BrickMap path to write in
                 * @param {object} Corresponding write data. Ex: brick hashes for the write operation
                 * @param {callback} callback
                 */
                validate: (dirtyBrickMap, operation, brickMapPath, data, callback) => {
                    console.log(operation, brickMapPath, data);
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
            brickMapHistory: {
                /**
                 * @param {Array<BrickMap>} A list of BrickMap diffs that make up a valid BrickMap
                 * @param {callback} callback
                 */
                validate: (brickMapDiffs, callback) => {
                    console.log('BrickMap History', brickMapDiffs);
                    // Assume history is invalid
                    return callback(new Error('BrickMap history is invalid'));
                }
            }
        }
    }, (err) => {
        assert.true(typeof err !== 'undefined', "DSU cannot be loaded");
        assert.true(err.message === 'BrickMap history is invalid');
        callback();
    })

}