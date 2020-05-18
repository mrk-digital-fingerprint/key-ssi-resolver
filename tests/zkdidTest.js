'use strict';

require("../../../psknode/bundles/testsRuntime");

const dc = require("double-check");
const assert = dc.assert;

const DID_TYPES = require('../lib/constants').DID_TYPES;
const DIDFactory = require('../lib/DID/Factory');
const ZKDID = require('../lib/DID/ZKDID');

const didFactory = new DIDFactory();

assert.callback('ZKDID Test', (done) => {
    const did = didFactory.create(DID_TYPES.Secret, {
        dlDomain: 'local',
        favouriteEndpoint: 'http://localhost:8080'
    });

    const zkdid = did.getZKDID();
    assert.true(zkdid.getDLDomain() === 'local', 'did has correct dldomain');
    assert.true(zkdid.getFavouriteEndpoint() === 'http://localhost:8080', 'did has correct favourite endpoint');
    assert.true(zkdid.getAnchorAlias().length > 0, 'did anchor alias is a non empty string');
    assert.true(zkdid.getSignature().length > 0, 'did has a non emptry string signature');

    const didUrl = zkdid.toUrl();
    assert.true(typeof didUrl === 'string', 'did url is a string');

    const restoredZKDID = didFactory.create(didUrl);
    assert.true(restoredZKDID.getAnchorAlias() === zkdid.getAnchorAlias(), 'restored did has correct anchor alias');
    assert.true(restoredZKDID.getDLDomain() === zkdid.getDLDomain(), 'restored did has correct dldomain');
    assert.true(restoredZKDID.getFavouriteEndpoint() === zkdid.getFavouriteEndpoint(), 'restored did has correct favourite domain');
    assert.true(restoredZKDID.getSignature() === zkdid.getSignature(), 'restored did has correct signature');
    done();
});
