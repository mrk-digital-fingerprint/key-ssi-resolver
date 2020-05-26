'use strict';

module.exports = {
    DEFAULT_DOMAIN: 'localDomain',
    DID_VERSION: '1',
    DID_TYPES: {
        Secret: 'SecretDID',
        ZK: 'ZKDID'
    },
    BUILTIN_DSU_REPR: {
        Bar: 'Bar',
        RawDossier: 'RawDossier',
        WebDossier: 'WebDossier',
        NodeDossier: 'NodeDossier',
    },
    DEFAULT_ANCHOR_VERIFICATION_STRATEGY: 'Simple',
    //DEFAULT_ANCHOR_VERIFICATION_STRATEGY: 'Diff',
    BUILTIN_ANCHOR_VERIFICATION_STRATEGIES: {
        Simple: 'Simple',
        Diff: 'Diff'
    }
}
