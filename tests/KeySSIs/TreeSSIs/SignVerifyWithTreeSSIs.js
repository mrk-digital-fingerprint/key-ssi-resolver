require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;
const CryptoAlgorithmsRegistry = require("../../../lib/KeySSIs/CryptoAlgorithmsRegistry");

const SSITypes = require("../../../lib/KeySSIs/SSITypes.js");
const RootSSI = require("../../../lib/KeySSIs/TreeSSIs/RootSSI");

const defaultDomain = "domain"
const defaultData = "Hello world."

assert.callback("RootSSI successfull NodeSSI derivation", (callback) => {
  const rootSSI = RootSSI.createRootSSI();
  rootSSI.initialize(defaultDomain)

  const signature = rootSSI.sign(defaultData)
  const verify = rootSSI.verify(defaultData, signature)
  assert.true(verify === true)

  callback()
});

// assert.callback("NodeSSI sign and LeafSSI verification", (callback) => {

// });