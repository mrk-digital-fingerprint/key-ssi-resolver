require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;

const RootSSI = require("../../../lib/KeySSIs/SeedSSIsV1/RootSSI");

const defaultDomain = "domain"
const defaultData = "Hello world."

assert.callback("RootSSI successful signature and verification", (callback) => {
  const rootSSI = RootSSI.createRootSSI();
  rootSSI.initialize(defaultDomain)

  const leafSSI = rootSSI.derive()

  const signature = rootSSI.sign(defaultData)
  const verify = leafSSI.verify(defaultData, signature)
  assert.true(verify)

  callback()
});

assert.callback("NodeSSI successful signature and verification", (callback) => {
  const rootSSI = RootSSI.createRootSSI();
  rootSSI.initialize(defaultDomain);
  const nodeSSI = rootSSI.deriveChild()

  const leafSSI = nodeSSI.derive()

  const signature = nodeSSI.sign(defaultData)
  const verify = leafSSI.verify(defaultData, signature)
  assert.true(verify)

  callback()
});

assert.callback("LeafSSI revocation resulting in failed future verification for new signatures", (callback) => {
  const rootSSI = RootSSI.createRootSSI();
  rootSSI.initialize(defaultDomain);
  const nodeSSI = rootSSI.deriveChild()

  const leafSSI = nodeSSI.derive()

  const validOldSignature = nodeSSI.sign(defaultData)
  const verifyOldSignature = leafSSI.verify(defaultData, validOldSignature)
  assert.true(verifyOldSignature)

  const newLeafSSI = nodeSSI.derive(Date.now())
  const invalidNewSignature = nodeSSI.sign(defaultData)
  const verifyNewSignature = newLeafSSI.verify(defaultData, invalidNewSignature)
  assert.false(verifyNewSignature)

  assert.true(verifyOldSignature)
  callback()
});