'use strict';

module.exports = {
    DEFAULT_DOMAIN: 'localDomain',
    DID_VERSION: '1',
    didTypes: {
        SECRET: 'SecretDID',
        ZK: 'ZKDID'
    },
    builtinDSURepr: {
        BAR: 'Bar',
        RAW_DOSSIER: 'RawDossier',
        WEB_DOSSIER: 'WebDossier',
        NODE_DOSSIER: 'NodeDossier',
    },
    DEFAULT_BAR_MAP_STRATEGY: 'Diff',
    builtinBarMapStrategies: {
        DIFF: 'Diff'
    }
}
