'use strict';

require("../../../psknode/bundles/testsRuntime");
const SecretDID = require('../lib/DID/SecretDID');
const ZKDID = require('../lib/DID/ZKDID');

const dc = require("double-check");
const assert = dc.assert;


assert.callback('ZKDID Test', (done) => {
    const did = new SecretDID({
        dlDomain: 'local',
        favouriteEndpoint: 'http://localhost:8080'
    });

    const zkdid = did.getZKDID();
    assert.true(zkdid instanceof ZKDID, 'did has correct instance');
    assert.true(zkdid.getDLDomain() === 'local', 'did has correct dldomain');
    assert.true(zkdid.getFavouriteEndpoint() === 'http://localhost:8080', 'did has correct favourite endpoint');
    assert.true(zkdid.getAnchorAlias().length > 0, 'did anchor alias is a non empty string');
    assert.true(zkdid.getSignature().length > 0, 'did has a non emptry string signature');

    const didUrl = zkdid.toUrl();
    assert.true(typeof didUrl === 'string', 'did url is a string');

    const restoredZKDID = new ZKDID(didUrl);
    assert.true(restoredZKDID.getAnchorAlias() === zkdid.getAnchorAlias(), 'restored did has correct anchor alias');
    assert.true(restoredZKDID.getDLDomain() === zkdid.getDLDomain(), 'restored did has correct dldomain');
    assert.true(restoredZKDID.getFavouriteEndpoint() === zkdid.getFavouriteEndpoint(), 'restored did has correct favourite domain');
    assert.true(restoredZKDID.getSignature() === zkdid.getSignature(), 'restored did has correct signature');
    done();
});
