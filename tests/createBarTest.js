// Throwaway test
require('../../../psknode/bundles/testsRuntime');
require('../../../psknode/bundles/edfsBar');

const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const KeyDIDResolver = require('../lib/KeyDIDResolver');
const BootstrapingService = require('../lib/BootstrapingService').Service;

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
                endpoint: 'http://localhost:8080',
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
                endpoint: 'http://localhost:8080',
                protocol: 'EDFS' // working endpoint
            }
        ]
    },
    dlDomain: 'localDomain'
};

const DSU_REPRESENTATIONS = constants.BUILTIN_DSU_REPR;
const bootstrapingService = new BootstrapingService(options.endpointsConfiguration);
const keyDidResolver = new KeyDIDResolver({
    bootstrapingService,
    dlDomain: 'local'
});

assert.callback('Create Bar Test', (done) => {

    keyDidResolver.createDSU(DSU_REPRESENTATIONS.Bar, {
        favouriteEndpoint: 'http://localhost:8080'
    }, (err, dsu) => {

        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'Archive', 'DSU has the correct class');

        dsu.writeFile('my-file.txt', 'Lorem Ipsum', (err, hash) => {

            assert.true(typeof err === 'undefined', 'DSU is writable');

            dsu.readFile('my-file.txt', (err, data) => {

                assert.true(typeof err === 'undefined', 'DSU is readable');
                assert.true(data.toString() === 'Lorem Ipsum', 'File was read correctly');

                done();
            })
        })
    });

})
