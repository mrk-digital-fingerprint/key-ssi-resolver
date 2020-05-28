'use strict';

require('../../../psknode/bundles/testsRuntime');
require('../../../psknode/bundles/edfsBar');

const tir = require('../../../psknode/tests/util/tir.js');
const testUtils = require('./utils');

const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const KeyDIDResolver = require('../lib/KeyDIDResolver');
const BootstrapingService = require('../lib/BootstrapingService').Service;

const DSU_REPRESENTATIONS = constants.BUILTIN_DSU_REPR;
const ANCHOR_VERIFICATION_STRATEGIES = constants.BUILTIN_ANCHOR_VERIFICATION_STRATEGIES;

const options = {
    endpointsConfiguration: {
        brickEndpoints: [
            {
                endpoint: 'http://localhost:8081',
                protocol: 'EDFS',
            },
            {
                endpoint: 'http://localhost:8002',
                protocol: 'EDFS'
            },
            {
                // placeholder will be replaced after a server node
                // is started
                endpoint: 'http://localhost:{port}',
                protocol: 'EDFS' // working endpoint
            }
        ],
        aliasEndpoints: [
            {
                endpoint: 'http://localhost:8081',
                protocol: 'EDFS'
            },
            {
                endpoint: 'http://localhost:8000',
                protocol: 'EDFS'
            },
            {
                // placeholder will be replaced after a server node
                // is started
                endpoint: 'http://localhost:{port}',
                protocol: 'EDFS' // working endpoint
            }
        ]
    },
    dlDomain: 'localDomain'
};

let bootstrapingService;
let keyDidResolver;
let favouriteEndpoint = 'http://localhost:{port}';

const FILE_PATH = '/something/something/darkside/my-file.txt';
const FILE_CONTENT =  'Lorem Ipsum';

testUtils.createTestFolder('create_bar_test_folder', (err, testFolder) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to create test folder');

    assert.callback('DiffAnchorVerificationStrategy Test', (done) => {
        tir.launchVirtualMQNode(10, testFolder, (err, serverPort) => {
            assert.true(err === null || typeof err === 'undefined', 'Failed to create server');

            testUtils.setValidPort(serverPort, options.endpointsConfiguration, 2);
            favouriteEndpoint = favouriteEndpoint.replace('{port}', serverPort);

            bootstrapingService = new BootstrapingService(options.endpointsConfiguration);
            keyDidResolver = new KeyDIDResolver({
                bootstrapingService,
                dlDomain: 'local'
            });

            runTest(done);
        })
    }, 2000);
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
