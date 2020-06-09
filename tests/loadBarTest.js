'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const dsuRepresentations = require('../lib/constants').builtinDSURepr;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'load_bar_test_folder', testName: 'Load BAR Test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint

    createBar((err, did) => {
        assert.true(typeof err === 'undefined', 'DSU is writable');
        runTest(did, result.doneCallback);
    });
});

function createBar(callback) {
    keyDidResolver.createDSU(dsuRepresentations.BAR, {
        favouriteEndpoint
    }, (err, dsu) => {

        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'Archive', 'DSU has the correct class');

        dsu.createFolder('/created-folder', (err) => {
            dsu.writeFile('my-file.txt', 'Lorem Ipsum', (err, hash) => {
                dsu.writeFile('/created-folder/my-second-file.txt', 'Iorem Lpsum', (err, hash) => {
                    callback(err, dsu.getDID());
                })
            })
        })
    });
}

function runTest(did, callback) {
    keyDidResolver.loadDSU(did, dsuRepresentations.BAR, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile('my-file.txt', (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while reading file from DSU');

            assert.true(data.toString() === 'Lorem Ipsum', 'File has the correct content');

            dsu.readFile('/created-folder/my-second-file.txt', (err, data) => {
                assert.true(typeof err === 'undefined', 'No error while reading second file from DSU');
                assert.true(data.toString() === 'Iorem Lpsum', 'Second file has the correct content');
                callback();
            })
        });
    });
}


