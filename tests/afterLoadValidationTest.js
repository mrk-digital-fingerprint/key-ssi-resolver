'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const dsuRepresentations = require('../lib/constants').builtinDSURepr;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'afterload_validation_test', testName: 'AfterLoad Validation Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint
    writeTestFile(result.doneCallback);
});

function writeTestFile(callback) {
    keyDidResolver.createDSU(dsuRepresentations.BAR, {
        favouriteEndpoint,
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        dsu.writeFile('/my-file.txt', 'Test', (err) => {
            assert.true(typeof err === 'undefined', 'File is written');
            runTest(dsu.getDID(), callback);
        });
    });
}

function runTest(did, callback) {
    const afterBarMapLoadValidation = {
        validate: (barMap, callback) => {
            callback(new Error('Invalid BarMap'));
        }
    }

    keyDidResolver.loadDSU(did, dsuRepresentations.BAR, {
        validationRules: {
            afterLoad: afterBarMapLoadValidation
        }
    }, (err, dsu) => {
            assert.true(typeof err !== 'undefined', 'Loading failed due to validation error');
            assert.true(err.message === 'Invalid BarMap');
            callback();
    })
}

