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

testUtils.didResolverFactory({testFolder: 'custom_diff_as_test', testName: 'Custom Diff anchoring strategy test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint

    runTest(result.doneCallback);
});

function runTest(callback) {
    let writesCounter = 0;
    let did;

    function anchoringCallback(err, hash) {
        assert.true(typeof err === 'undefined', 'No error while anchoring changes');
        assert.true(typeof hash === 'string' && hash.length > 0, 'Hash is a non empty string');
        assertChangesWereAnchored(did, callback);
    }

    /**
     * 
     * Anchor changes after 3 writes
     * @param {BarMap} sessionBarMap 
     * @param {callback} callback 
     */
    function decisionFunction(sessionBarMap, callback) {
        if (writesCounter++ < 3) {
            return callback(undefined, false);
        }

        writesCounter = 0;
        return callback(undefined, true);
    }

    keyDidResolver.createDSU(dsuRepresentations.BAR, {
        favouriteEndpoint,
        barMapStrategy: barMapStrategies.DIFF,
        anchoringOptions: {
            decisionFn: decisionFunction,
            anchoringCb: anchoringCallback
        }
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        did = dsu.getDID();

        assertFileWasWritten(dsu, '/file1.txt', 'Lorem 1', () => {
            assertFileWasWritten(dsu, '/file2.txt', 'Lorem 2', () => {
                assertFileWasWritten(dsu, '/file3.txt', 'Lorem 3', () => {
                    assertChangesWereNotAnchored(did, () => {
                        assertFileWasWritten(dsu, '/file4.txt', 'Lorem 4', () => {
                            assertFileWasWritten(dsu, '/file5.txt', 'Lorem 5', () => {
                                console.log('File was written to a new session');
                            })
                        })
                    })
                })
            })

        });
    });
}

function assertFileWasWritten(dsu, filename, data, callback) {
    dsu.writeFile(filename, data, (err, hash) => {
        assert.true(typeof err === 'undefined', 'DSU is writable');

        dsu.readFile(filename, (err, dt) => {
            assert.true(typeof err === 'undefined', 'DSU is readable');
            assert.true(dt.toString() === data, 'File was read correctly');

            callback();
        })
    })
}

function assertChangesWereNotAnchored(did, callback) {
    keyDidResolver.loadDSU(did, dsuRepresentations.BAR, {
        barMapStrategy: barMapStrategies.DIFF,
    }, (err, dsu) => {
        assert.true(typeof err !== 'undefined', "DSU hasn't been anchored");
        callback();
    });
}

function assertChangesWereAnchored(did, callback) {
    keyDidResolver.loadDSU(did, dsuRepresentations.BAR, {
        barMapStrategy: barMapStrategies.DIFF,
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', "DSU has been anchored");

        assertFileWasAnchored(dsu, '/file1.txt', 'Lorem 1', () => {
            assertFileWasAnchored(dsu, '/file2.txt', 'Lorem 2', () => {
                assertFileWasAnchored(dsu, '/file3.txt', 'Lorem 3', () => {
                    assertFileWasAnchored(dsu, '/file4.txt', 'Lorem 4', () => {
                        callback();
                    })
                })
            })
        })
    });
}

function assertFileWasAnchored(dsu, path, expectedData, callback) {
    dsu.readFile(path, (err, data) => {
        assert.true(typeof err === 'undefined', 'DSU is readable');
        assert.true(data.toString() === expectedData, 'File was read correctly');

        callback();
    })

}