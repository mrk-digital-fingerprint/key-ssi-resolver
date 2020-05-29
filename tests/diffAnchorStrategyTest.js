'use strict';
const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const DSU_REPRESENTATIONS = constants.BUILTIN_DSU_REPR;
const ANCHOR_VERIFICATION_STRATEGIES = constants.BUILTIN_ANCHOR_VERIFICATION_STRATEGIES;

let keyDidResolver;
let favouriteEndpoint;

const FILE_PATH = '/something/something/darkside/my-file.txt';
const FILE_CONTENT =  'Lorem Ipsum';

testUtils.didResolverFactory({testFolder: 'diff_as_test', testName: 'Diff AnchorVer strategy test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint

    runTest(result.doneCallback);
});

function runTest(callback) {
    keyDidResolver.createDSU(DSU_REPRESENTATIONS.Bar, {
        favouriteEndpoint,
        anchorVerificationStrategyName: ANCHOR_VERIFICATION_STRATEGIES.Diff
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');

        writeAndReadTest(dsu, callback);
    });
}

function writeAndReadTest(dsu, callback) {
    dsu.writeFile(FILE_PATH, FILE_CONTENT, (err, hash) => {
        console.log(err);
        assert.true(typeof err === 'undefined', 'DSU is writable');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err === 'undefined', 'DSU is readable');
            assert.true(data.toString() === FILE_CONTENT, 'File was read correctly');

            loadTest(dsu.getDID(), callback);
        })
    })
}

function loadTest(did, callback) {
    keyDidResolver.loadDSU(did, DSU_REPRESENTATIONS.Bar, {
        anchorVerificationStrategyName: ANCHOR_VERIFICATION_STRATEGIES.Diff
    }, (err, dsu) => {
        console.log(err);
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while reading file from DSU');

            assert.true(data.toString() === FILE_CONTENT, 'File has the correct content');
            deleteTest(dsu, callback);
        });
    });
}

function deleteTest(dsu, callback) {
    dsu.delete(FILE_PATH, (err) => {
        assert.true(typeof err === 'undefined', 'File was deleted without error');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err !== 'undefined', 'File still exists');

            renameTest(dsu.getDID(), callback);
        })
    })
}

function renameTest(did, callback) {
    keyDidResolver.loadDSU(did, DSU_REPRESENTATIONS.Bar, {
        anchorVerificationStrategyName: ANCHOR_VERIFICATION_STRATEGIES.Diff
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.writeFile(FILE_PATH, FILE_CONTENT, (err, data) => {
            assert.true(typeof err === 'undefined', 'No error while write file in DSU');

            dsu.rename(FILE_PATH, '/my-file.txt', (err) => {
                assert.true(typeof err === 'undefined', 'No error while renaming file in DSU');

                renameTestAfterLoad(dsu.getDID(), callback);
            })
        });
    });
}

function renameTestAfterLoad(did, callback) {
    keyDidResolver.loadDSU(did, DSU_REPRESENTATIONS.Bar, {
        anchorVerificationStrategyName: ANCHOR_VERIFICATION_STRATEGIES.Diff
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while loading the DSU');

        dsu.readFile(FILE_PATH, (err, data) => {
            assert.true(typeof err !== 'undefined', 'File still exists');

            dsu.readFile('/my-file.txt', (err, data) => {
                assert.true(typeof err === 'undefined', 'No error while reading file from DSU');
                assert.true(data.toString() === FILE_CONTENT, 'File has the correct content');
                callback();
            })
        })
    });
}
