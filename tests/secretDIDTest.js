// Throwaway test
require('../../../psknode/bundles/testsRuntime');
require("../../../psknode/bundles/pskruntime");
require("../../../psknode/bundles/pskWebServer");
require("../../../psknode/bundles/edfsBar");

const DIDResolver = require('psk-did-resolver');

const secretDID = new DIDResolver.DID.SecretDID({
    dlDomain: 'local',
    favouriteEndpoint: 'http://localhost:8080'
});

console.log('========== Initial SecretDID');
console.log(secretDID.toUrl());
console.log(secretDID.getKey());
console.log(secretDID.getAnchorAlias());
console.log(secretDID.getDLDomain());
console.log(secretDID.getFavouriteEndpoint());

const existingSecretDID = new DIDResolver.DID.SecretDID(secretDID.toUrl(false));
console.log('========== Restored SecretDID');
console.log(existingSecretDID.toUrl());
console.log(existingSecretDID.getKey());
console.log(existingSecretDID.getAnchorAlias());
console.log(existingSecretDID.getDLDomain());
console.log(existingSecretDID.getFavouriteEndpoint());

const zkdid = existingSecretDID.getZKDID();
console.log('========== First ZKDID');
console.log(zkdid.toUrl());
console.log(zkdid.getAnchorAlias());
console.log(zkdid.getDLDomain());
console.log(zkdid.getFavouriteEndpoint());

const zkdid2 = existingSecretDID.getZKDID();
console.log('========== Second ZKDID');
console.log(zkdid2.toUrl());
console.log(zkdid2.getAnchorAlias());
console.log(zkdid2.getDLDomain());
console.log(zkdid2.getFavouriteEndpoint());

const restoredZkdid = new DIDResolver.DID.ZKDID(zkdid2.toUrl() + '#http://localhost');
console.log('========== Restored ZKDID');
console.log(restoredZkdid.toUrl());
console.log(restoredZkdid.getAnchorAlias());
console.log(restoredZkdid.getDLDomain());
console.log(restoredZkdid.getFavouriteEndpoint());
