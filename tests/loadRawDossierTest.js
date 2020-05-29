'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const DSU_REPRESENTATIONS = require('../lib/constants').BUILTIN_DSU_REPR;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'load_rawdossier_test_folder', testName: 'Load RawDossier Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint

    createBar((err, did) => {
        assert.true(typeof err === 'undefined', 'DSU is writable');
        runTest(did, result.doneCallback);
    });
});

function createBar(callback) {
    keyDidResolver.createDSU(DSU_REPRESENTATIONS.RawDossier, {
        favouriteEndpoint
    }, (err, dsu) => {

        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'RawDossier', 'DSU has the correct class');

        dsu.writeFile('my-file.txt', 'Lorem Ipsum', (err, hash) => {
            callback(err, dsu.getDID());
        })
    });
}

function runTest(did, callback) {
    keyDidResolver.loadDSU(did, DSU_REPRESENTATIONS.RawDossier, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile('my-file.txt', (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while reading file from DSU');

            assert.true(data.toString() === 'Lorem Ipsum', 'File has the correct content');
            callback();
        });
    });
}


