require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;

const RootSSI = require("../../../lib/KeySSIs/TreeSSIs/RootSSI");

const defaultDomain = "domain"
const defaultData = "Hello world."

assert.callback("RootSSI successful signature and verification", (callback) => {
  const rootSSI = RootSSI.createRootSSI();
  rootSSI.initialize(defaultDomain)

  const leafSSI = rootSSI.derive()

  const signature = rootSSI.sign(defaultData)
  const verify = leafSSI.verify(defaultData, signature)
  assert.true(verify === true)

  callback()
});

assert.callback("NodeSSI successful signature and verification", (callback) => {
  const rootSSI = RootSSI.createRootSSI();
  rootSSI.initialize(defaultDomain);
  const nodeSSI = rootSSI.deriveChild()

  const leafSSI = nodeSSI.derive()

  const signature = nodeSSI.sign(defaultData)
  const verify = leafSSI.verify(defaultData, signature)
  assert.true(verify === true)

  callback()
});
