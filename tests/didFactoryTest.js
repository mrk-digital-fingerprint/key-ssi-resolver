'use strict';

require("../../../psknode/bundles/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;

const didTypes = require('../lib/constants').didTypes;
const DIDFactory = require('../lib/DID/Factory');
const SecretDID = require('../lib/DID/SecretDID');
const ZKDID = require('../lib/DID/ZKDID');

const didFactory = new DIDFactory();

assert.callback('DIDFactory create error - not enough parameters test', (done) => {
    let secretDID
    let createException;

    try {
        secretDID = didFactory.create(didTypes.SECRET);
    } catch (e) {
        createException = e;
    }

    assert.true(createException.message.startsWith('Invalid URL. Are you trying to create a new DID?'), 'Factory returns correct "create" error message');
    done();
});

assert.callback('DIDFactory create new DID test', (done) => {
    const secretDID = didFactory.create(didTypes.SECRET, {
        'dlDomain': 'local',
        'favouriteEndpoint': 'http://localhost:8080'
    });

    assert.true(secretDID instanceof SecretDID), 'DID has correct class';

    // Test creating did instance from url
    const didUrl = secretDID.toUrl();
    const restoredSecretDID = didFactory.create(didUrl);
    assert.true(restoredSecretDID instanceof SecretDID, 'Restored DID from url has correct class');
    assert.true(secretDID.toUrl() === restoredSecretDID.toUrl(), 'Restored DID is the same as the original DID');
    done();
});

assert.callback('DIDFactory create a ZKDID test', (done) => {
    const secretDID = didFactory.create(didTypes.SECRET, {
        'dlDomain': 'local',
        'favouriteEndpoint': 'http://localhost:8080'
    });

    assert.true(secretDID instanceof SecretDID), 'DID has correct class';

    const zkdid = secretDID.getZKDID();
    const didUrl = zkdid.toUrl();

    const restoredZKDID = didFactory.create(didUrl);
    assert.true(restoredZKDID instanceof ZKDID, 'ZKDID has the correct class');
    done();
});
