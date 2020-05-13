// Throwaway test
require('../../../psknode/bundles/testsRuntime');
require("../../../psknode/bundles/pskruntime");
require("../../../psknode/bundles/pskWebServer");
require("../../../psknode/bundles/edfsBar");

const DIDResolver = require('psk-did-resolver');

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

const resolverInstance = DIDResolver.factory(options);
const DSU_TYPES = DIDResolver.constants.DSU_TYPES;

resolverInstance.createDID(DSU_TYPES.Bar, (err, did) => {
    console.log(err, did);
});
