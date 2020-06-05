'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const dsuRepresentations = constants.builtinDSURepr;
const barMapStrategies = constants.builtinBarMapStrategies;

let keyDidResolver;
let favouriteEndpoint;

const FILE_PATH = '/something/something/darkside/my-file.txt';
const FILE_CONTENT =  'Lorem Ipsum';

const SECOND_FILE_PATH = '/my-second-file.txt';
const SECOND_FILE_CONTENT = 'Ipsum Lorem';

testUtils.didResolverFactory({testFolder: 'anchoring_default_conflict_resolution_test', testName: 'Anchoring default conflict resolution test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint

    runTest(result.doneCallback);
});

function runTest(callback) {
    keyDidResolver.createDSU(dsuRepresentations.BAR, {
        favouriteEndpoint,
        barMapStrategy: barMapStrategies.DIFF
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        writeAndReadTest(dsu, callback);
    });
}

function writeAndReadTest(dsu, callback) {
    dsu.writeFile(FILE_PATH, FILE_CONTENT, (err, hash) => {
        assert.true(typeof err === 'undefined', 'DSU is writable');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err === 'undefined', 'DSU is readable');
            assert.true(data.toString() === FILE_CONTENT, 'File was read correctly');

            loadSameDSU(dsu.getDID(), dsu, callback);
        })
    })
}

function loadSameDSU(did, oldDSU, callback) {
    keyDidResolver.loadDSU(did, dsuRepresentations.BAR, {
        barMapStrategy: barMapStrategies.DIFF
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.writeFile(SECOND_FILE_PATH, SECOND_FILE_CONTENT, (err) => {
            assert.true(typeof err === 'undefined', 'No error while writing second file');

            writeFileInOldDSU(oldDSU, callback);
        });
    });
}

function writeFileInOldDSU(dsu, callback) {
    dsu.writeFile('/new-file.txt', 'Some data', (err) => {
        assert.true(typeof err === 'undefined', 'No error while writing file in the old DSU');

        readFilesTest(dsu.getDID(), callback);
    })
}

function readFilesTest(did, callback) {
    keyDidResolver.loadDSU(did, dsuRepresentations.BAR, {
        barMapStrategy: barMapStrategies.DIFF
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while reading first file in DSU');

            assert.true(FILE_CONTENT === data.toString(), 'First file has the correct content');

            dsu.readFile(SECOND_FILE_PATH, (err, data) => {
                assert.true(typeof err === 'undefined', 'No error while reading second file in DSU');

                assert.true(SECOND_FILE_CONTENT === data.toString(), 'Third file has the correct content');

                dsu.readFile('/new-file.txt', (err, data) => {
                    assert.true(typeof err === 'undefined', 'No error while reading third file in DSU');

                    assert.true('Some data' === data.toString(), 'Third file has the correct content');
                    callback();
                })
            })
        });
    });
}