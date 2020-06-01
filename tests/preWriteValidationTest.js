'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const dsuRepresentations = require('../lib/constants').builtinDSURepr;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'prewrite_validation_test', testName: 'PreWrite Validation Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint
    runTest(result.doneCallback);
});

function runTest(callback) {
    keyDidResolver.createDSU(dsuRepresentations.BAR, {
        favouriteEndpoint,
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        const preWriteValidation = {
            validate: (barMap, operation, path, options, callback) => {
                return callback(new Error('Validation error'));
            }
        }

        dsu.setValidationRules({
            preWrite: preWriteValidation
        });

        dsu.writeFile('/my-file.txt', 'Test', (err) => {
            assert.true(typeof err !== 'undefined', 'Write failed due to validation error');
            assert.true(err.message === 'Validation error');
            callback();
        });
    });
}


