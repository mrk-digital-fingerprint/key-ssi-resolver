require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../../lib/KeySSIs/SSITypes.js");
const RootSSI = require("../../../lib/KeySSIs/TreeSSIs/RootSSI");

const defaultDomain = "domain"
const defaultVersion = "v0"

assert.callback("RootSSI successful NodeSSI derivation", (callback) => {
  const rootSSI = RootSSI.createRootSSI();
  rootSSI.initialize(defaultDomain)


  const childNode = rootSSI.deriveChild()

  // current child count
  assert.true(rootSSI.getChildCount() === 1)

  // type
  assert.true(childNode.getTypeName() === SSITypes.NODE_SSI);

  // domain
  assert.true(childNode.getDLDomain() === defaultDomain);

  // specific string
  assert.true(typeof childNode.getSpecificString() === 'string');
  assert.true(childNode.getSpecificString().length === 44);
  // control string
  assert.true(!!childNode.getControlString() === false);

  // version
  assert.true(childNode.getVn() === defaultVersion);

  // hint
  assert.true(childNode.isHintValid() === true);
  assert.true(typeof childNode.getChainCode() === 'string');
  assert.true(childNode.getChainCode().length > 1);
  assert.true(childNode.getNodePosition() === '0-1');

  callback()
});

assert.callback("Multiple NodeSSI derivation is deterministic", (callback) => {
  const rootA = RootSSI.createRootSSI();
  rootA.initialize(defaultDomain);

  const rootB = RootSSI.createRootSSI(rootA.getIdentifier(true));

  const childA0 = rootA.deriveChild()
  const childA1 = rootA.deriveChild()
  const childB0 = rootB.deriveChild()
  const childB1 = rootB.deriveChild()

  assert.true(childA0.getSpecificString() != childA1.getSpecificString())
  assert.equal(rootA.getChildCount(), rootB.getChildCount())
  assert.equal(childA0.getIdentifier(true), childB0.getIdentifier(true))
  assert.equal(childA1.getIdentifier(true), childB1.getIdentifier(true))

  callback()
});

assert.callback("Multiple Nested NodeSSI derivation is deterministic", (callback) => {
  const rootA = RootSSI.createRootSSI();
  rootA.initialize(defaultDomain);

  const rootB = RootSSI.createRootSSI(rootA.getIdentifier(true));

  const childA0 = rootA.deriveChild()
  const childA01 = childA0.deriveChild()
  const childB0 = rootB.deriveChild()
  const childB01 = childB0.deriveChild()

  assert.equal(childA0.getChildCount(), 1)
  assert.equal(childB0.getChildCount(), 1)
  assert.equal(childA0.getIdentifier(true), childB0.getIdentifier(true))
  assert.equal(childA01.getIdentifier(true), childB01.getIdentifier(true))

  callback()
});


// assert.callback("Generate deterministically NodeSSI at position '0-1-3'", (callback) => {

// });
