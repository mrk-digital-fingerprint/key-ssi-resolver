'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const dsuRepresentations = require('../lib/constants').builtinDSURepr;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'create_raw_dossier_test_folder', testName: 'Create RawDossier test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint
    runTest(result.doneCallback);
});

function runTest(callback) {
    keyDidResolver.createDSU(dsuRepresentations.RAW_DOSSIER, {
        favouriteEndpoint
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'RawDossier', 'DSU has the correct class');

        dsu.writeFile('my-file.txt', 'Lorem Ipsum', (err, hash) => {

            assert.true(typeof err === 'undefined', 'DSU is writable');

            dsu.readFile('my-file.txt', (err, data) => {

                assert.true(typeof err === 'undefined', 'DSU is readable');
                assert.true(data.toString() === 'Lorem Ipsum', 'File was read correctly');

                callback();
            })
        })
    });
}


