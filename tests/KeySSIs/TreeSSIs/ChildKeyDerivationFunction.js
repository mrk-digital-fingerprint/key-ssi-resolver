const crypto = require('crypto');

require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;
const pskCrypto = require('../../../../pskcrypto')
const {createRootSSI} = require("../../../lib/KeySSIs/TreeSSIs/RootSSI");



assert.callback("Parent -> Child [privateKey, chainCode] tuple derivation", (callback) => {
    const rootSSI = createRootSSI()
    rootSSI.initialize()
    const childNodeSSI = rootSSI.deriveChild()

    const parentPrivateKey = rootSSI.getPrivateKey()
    const parentChainCode = rootSSI.getChainCode()

    const childPrivateKey = childNodeSSI.getPrivateKey()
    const childChainCode = childNodeSSI.getChainCode()

    assert.true(parentPrivateKey.toString('hex').length === 64)
    assert.true(parentChainCode.toString('hex').length === 64)
    assert.true(childPrivateKey.toString('hex').length === 64)
    assert.true(childChainCode.toString('hex').length === 64)

    assert.true(childPrivateKey.toString('hex') !== parentPrivateKey.toString('hex'));
    assert.true(childChainCode.toString('hex') !== parentChainCode.toString('hex'));

    callback()
});

assert.callback("Sign and Verify with derived child key", (callback) => {
    const rootSSI = createRootSSI()
    rootSSI.initialize()
    const childNodeSSI = rootSSI.deriveChild()

    const childPrivateKey = childNodeSSI.getPrivateKey()

    const childEllipticCurve = crypto.createECDH('secp256k1');
    childEllipticCurve.setPrivateKey(childPrivateKey);
    const childPubKey = childEllipticCurve.getPublicKey()

    const keysGenerator = pskCrypto.createKeyPairGenerator()
    const pemKeys = keysGenerator.getPemKeys(childPrivateKey, childPubKey);

    const data = 'some data to sign'
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    const signature = sign.sign(pemKeys.privateKey );

    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    const result = verify.verify(pemKeys.publicKey, signature)
    assert.true(result)

    callback();
})