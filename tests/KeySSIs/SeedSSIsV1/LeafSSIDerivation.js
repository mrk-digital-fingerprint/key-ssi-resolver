require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../../lib/KeySSIs/SSITypes.js");
const RootSSI = require("../../../lib/KeySSIs/SeedSSIsV1/RootSSI");

const defaultDomain = "domain"
const defaultVersion = "v0"

assert.callback("RootSSI successful LeafSSI derivation", (callback) => {
    const rootSSI = RootSSI.createRootSSI();
    rootSSI.initialize(defaultDomain)


    const leafSSI = rootSSI.derive()

    // current child count
    assert.true(rootSSI.getChildCount() === 0)
    // type
    assert.true(leafSSI.getTypeName() === SSITypes.LEAF_SSI);
    // domain
    assert.true(leafSSI.getDLDomain() === defaultDomain);
    // specific string
    assert.true(!!leafSSI.getSpecificString() === false);
    // control string
    assert.true(typeof leafSSI.getControlString() === 'string');
    // version
    assert.true(leafSSI.getVn() === defaultVersion);

    callback()
});

assert.callback("NodeSSI successful LeafSSI derivation", (callback) => {
    const rootSSI = RootSSI.createRootSSI();
    rootSSI.initialize(defaultDomain);
    const nodeSSI = rootSSI.deriveChild()


    const leafSSI = nodeSSI.derive()

    // current child count
    assert.true(nodeSSI.getChildCount() === 0)
    // type
    assert.true(leafSSI.getTypeName() === SSITypes.LEAF_SSI);
    // domain
    assert.true(leafSSI.getDLDomain() === defaultDomain);
    // specific string
    assert.true(!!leafSSI.getSpecificString() === false);
    // control string
    assert.true(typeof leafSSI.getControlString() === 'string');
    // version
    assert.true(leafSSI.getVn() === defaultVersion);

    callback()
});

assert.callback("Successful LeafSSI derivation with expiredAt param revoking the old one", (callback) => {
    const rootSSI = RootSSI.createRootSSI();
    rootSSI.initialize(defaultDomain)
    const timestamp = Date.now()
    const leafSSI = rootSSI.derive(timestamp);
    const hintObject = leafSSI.getHintObject();

    assert.true(typeof hintObject === 'object');
    assert.true(leafSSI.getExpiredAt() === timestamp)

    callback()
});