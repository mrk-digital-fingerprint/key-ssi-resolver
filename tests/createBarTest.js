// Throwaway test
require('../../../psknode/bundles/testsRuntime');
require('../../../psknode/bundles/edfsBar');

const dc = require("double-check");
const assert = dc.assert;

const constants = require('../lib/constants');
const DIDResolver = require('../lib/DIDResolver');
const BootstrapingService = require('../lib/BootstrapingService').Service;

const options = {
    endpointsConfiguration: {
        brickEndpoints: [
            {
                endpoint: 'http://localhost:8080',
                protocol: 'EDFS',
                isFavourite: true
            },
            {
                endpoint: 'http://localhost:8000',
                protocol: 'EDFS'
            }
        ],
        aliasEndpoints: [
            {
                endpoint: 'http://localhost:8080',
                protocol: 'EDFS'
            },
            {
                endpoint: 'http://localhost:8000',
                protocol: 'EDFS'
            }
        ]
    },
    dlDomain: 'localDomain'
};

const DSU_TYPES = constants.BUILTIN_DSU_TYPES;
const bootstrapingService = new BootstrapingService(options);
const didResolver = new DIDResolver({
    bootstrapingService,
    dlDomain: 'local'
});

assert.callback('Create Bar Test', (done) => {
    didResolver.createDSU(DSU_TYPES.Bar, (err, dsu) => {

        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'Archive', 'DSU has the correct class');

        dsu.writeFile('my-file.txt', 'Lorem Ipsum', (err, hash) => {
            assert.true(typeof err === 'undefined', 'DSU is writable');
            done();
        })
    });
})
