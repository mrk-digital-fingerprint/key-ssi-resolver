'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
require('../../../psknode/bundles/testsRuntime');
require('../../../psknode/bundles/edfsBar');
const tir = require('../../../psknode/tests/util/tir.js');
const dc = require("double-check");
const assert = dc.assert;
const KeySSIResolver = require('../lib/KeySSIResolver');
const BootstrapingService = require('../lib/BootstrapingService').Service;

const defaultDIDResolverConfiguration = {
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

const defaultFavouriteEndpoint = 'http://localhost:{port}';

function setValidPort(port, endpointsConfiguration, brickEndpointIndex, aliasEndpointIndex) {
    if (typeof aliasEndpointIndex === 'undefined') {
        aliasEndpointIndex = brickEndpointIndex;
    }

    const brickEndpoints = endpointsConfiguration.brickEndpoints;

    let endpoint = brickEndpoints[brickEndpointIndex];
    endpoint.endpoint = endpoint.endpoint.replace('{port}', port);

    const aliasEndpoints = endpointsConfiguration.aliasEndpoints;

    endpoint = aliasEndpoints[aliasEndpointIndex];
    endpoint.endpoint = endpoint.endpoint.replace('{port}', port);
}

function createTestFolder(prefix, callback) {
    const testFolderPath = path.join(os.tmpdir(), prefix);
    fs.mkdtemp(testFolderPath, (err, res) => {
        callback(err, res);
    });
}

function didResolverFactory(options, callback) {
    if (!options.conficonfiguration) {
        options.configuration = JSON.parse(JSON.stringify(defaultDIDResolverConfiguration));
    }

    if (!options.favouriteEndpoint) {
        options.favouriteEndpoint = defaultFavouriteEndpoint;
    }

    if (!options.brickEndpointIndex) {
        options.brickEndpointIndex = 2;
    }

    if (!options.aliasEndpointIndex) {
        options.aliasEndpointIndex = 2;
    }

    if (!options.dlDomain) {
        options.dlDomain = 'local'
    }

    createTestFolder(options.testFolder, (err, testFolder) => {
        if (err) {
            return callback(err);
        }

        assert.callback(options.testName, (done) => {
            tir.launchVirtualMQNode(10, testFolder, (err, serverPort) => {
                if (err) {
                    return callback(err);
                }

                setValidPort(serverPort, options.configuration.endpointsConfiguration, options.brickEndpointIndex, options.aliasEndpointIndex);
                options.favouriteEndpoint = options.favouriteEndpoint.replace('{port}', serverPort);

                const bootstrapingService = new BootstrapingService(options.configuration.endpointsConfiguration);
                const keyDidResolver = new KeySSIResolver({
                    bootstrapingService,
                    dlDomain: options.dlDomain || 'local'
                });

                callback(undefined, {
                    keyDidResolver,
                    doneCallback: done,
                    favouriteEndpoint: options.favouriteEndpoint,
                    dlDomain: options.dlDomain
                });
            })
        }, 2000);
    })
}


module.exports = {
    setValidPort,
    createTestFolder,
    didResolverFactory
}
