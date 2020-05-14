// Throwaway test
require('../../../psknode/bundles/testsRuntime');
require('../../../psknode/bundles/edfsBar');

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

didResolver.createDSU(DSU_TYPES.Bar, (err, did) => {
    console.log(err, did);
});
