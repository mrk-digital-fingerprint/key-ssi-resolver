'use strict';

const os = require('os');
require("../../../psknode/bundles/testsRuntime");
const tir = require('../../../psknode/tests/util/tir.js');
const dc = require("double-check");
const assert = dc.assert;

const pskKeyDidResolver = require('psk-key-did-resolver');

assert.callback('Smoke Test', (done) => {
    tir.launchVirtualMQNode(10, os.tmpdir(), (err, serverPort) => {
        const configuration = {
            endpointsConfiguration: {
                brickEndpoints: [
                    {
                        endpoint: `http://localhost:${serverPort}`,
                        protocol: 'EDFS'
                    }
                ],
                aliasEndpoints: [
                    {
                        endpoint: `http://localhost:${serverPort}`,
                        protocol: 'EDFS'
                    }
                ]
            },
            dlDomain: 'localDomain',
            favouriteEndpoint: `http://localhost:${serverPort}`
        }

        // Initialize the did resolver
        pskKeyDidResolver.initialize(configuration);

        assert.true($$.keyDidResolver.constructor.name === 'KeyDIDResolver');
        assert.true($$.dsuFactory.constructor.name === 'Factory');
        assert.true($$.bootstrapingService.constructor.name === 'Service');
        assert.true($$.barMapStrategyFactory.constructor.name === 'Factory');

        assert.true(typeof pskKeyDidResolver.DIDMixin === 'object');
        assert.true(typeof pskKeyDidResolver.BarMapStrategyMixin === 'object');
        assert.true(typeof pskKeyDidResolver.constants === 'object');
        done();
    });
}, 2000);