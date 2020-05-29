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
    DEFAULT_ANCHOR_VERIFICATION_STRATEGY: 'Simple',
    //DEFAULT_ANCHOR_VERIFICATION_STRATEGY: 'Diff',
    builtinAnchorVerificationStrategies: {
        SIMPLE: 'Simple',
        DIFF: 'Diff'
    }
}
