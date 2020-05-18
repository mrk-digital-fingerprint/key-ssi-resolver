'use strict';

require("../../../psknode/bundles/testsRuntime");
const dc = require("double-check");
const assert = dc.assert;

const DID_TYPES = require('../lib/constants').DID_TYPES;
const DIDFactory = require('../lib/DID/Factory');
const ZKDID = require('../lib/DID/ZKDID');

const didFactory = new DIDFactory();

assert.callback('SecretDID Test', (done) => {
    const did = didFactory.create(DID_TYPES.Secret, {
        dlDomain: 'local',
        version: '1',
        favouriteEndpoint: 'http://localhost:8080'
    });

    const didUrl = did.toUrl();
    assert.true(typeof didUrl === 'string', 'DID url is string');
    assert.true(didUrl.length > 0, 'DID url is not empty');
    assert.true(didUrl.startsWith('kdid:sa:1:local'), 'DID url has the correct prefix');
    assert.true(didUrl.endsWith('#http://localhost:8080'), 'DID url has favourite endpoint');
    assert.true(did.getHashAlgorithm() === 'pskhash', 'DID has the correct hash algorithm');
    assert.true(did.getEncryptionAlgorithm() === 'aes-256-gcm', 'DID has the correct encryption algorithm');
    assert.true(did.getSignatureAlgorithm() === 'pskhash', 'DID has the correct signature algorithm');

    assert.true(did.getDLDomain() === 'local', 'DID has the correct DLDomain');
    assert.true(did.getFavouriteEndpoint() === 'http://localhost:8080', 'DID has the favourite endpoint');
    assert.true(did.getKey() instanceof Buffer, 'DID has generated a key');
    assert.true(did.getKey().length === did.KEY_LENGTH, 'DID key has the correct length');
    assert.true(did.getAnchorAlias().length > 0, 'DID has an anchor alias');

    assert.true(did.getZKDID() instanceof ZKDID, 'DID returns a ZKDID');


    const didFromUrl = didFactory.create(didUrl);
    assert.true(didFromUrl.getDLDomain() === did.getDLDomain(), 'Restored DID has correct DLDomain');
    assert.true(didFromUrl.getFavouriteEndpoint() === did.getFavouriteEndpoint(), 'Restored DID has correct favourite endpoint');
    assert.true(didFromUrl.getKey().toString('hex') === did.getKey().toString('hex'), 'Restored DID has correct key');
    assert.true(didFromUrl.getAnchorAlias() === did.getAnchorAlias(), 'Restored DID has correct anchor alias');
    done();
})
