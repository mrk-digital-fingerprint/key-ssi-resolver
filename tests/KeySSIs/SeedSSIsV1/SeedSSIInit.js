require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../../lib/KeySSIs/SSITypes.js");
const RootSSI = require("../../../lib/KeySSIs/SeedSSIsV1/RootSSI");

const defaultDomain = "domain"
const defaultVersion = "v0"
const defaultSpecificString = "ApfxJHDRehBAc1qpCZdx5JnwCyLdbRcLQj5u1u6Z31s5"
const defautHint = '{"chainCode":"abc","nodePosition":"0"}'

assert.callback("RootSSI successfull initialization - all attributes valid", (callback) => {
    const rootSSI = RootSSI.createRootSSI();
    rootSSI.initialize(defaultDomain, (err, rSSI) => {
      if (err) {
          throw err;
      }
      // type
      assert.true(rSSI.getTypeName() === SSITypes.ROOT_SSI);

      // domain
      assert.true(rSSI.getDLDomain() === defaultDomain);
      //
      // // specific string
      assert.true(typeof rSSI.getSpecificString() === 'string');
      assert.true(rSSI.getSpecificString().length === 44);
      // // control string
      assert.true(!!rSSI.getControlString() === false);
      //
      // // version
      assert.true(rSSI.getVn() === defaultVersion);
      //
      // // hint
      assert.true(rSSI.isHintValid() === true);
      assert.true(typeof rSSI.getChainCode() === 'object');
      assert.true(rSSI.getNodePosition() === '0');
  
      callback();
    })
});


assert.callback("RootSSI successful load - all attributes valid", (callback) => {
  const id = `ssi:${SSITypes.ROOT_SSI}:${defaultDomain}:${defaultSpecificString}::${defaultVersion}:${defautHint}`
  const rootSSI = RootSSI.createRootSSI(id);
  // type
  assert.true(rootSSI.getTypeName() === SSITypes.ROOT_SSI);

  // domain
  assert.true(rootSSI.getDLDomain() === defaultDomain);

  // specific string
  assert.true(rootSSI.getSpecificString() === defaultSpecificString);
  // control string
  assert.true(!!rootSSI.getControlString() === false);

  // version
  assert.true(rootSSI.getVn() === defaultVersion);

  // hint
  assert.true(rootSSI.isHintValid() === true);
  assert.true(typeof rootSSI.getChainCode() === 'object');
  assert.true(typeof rootSSI.getChainCode() === 'object');
  assert.true(rootSSI.getNodePosition() === '0');

  callback();
});

assert.callback("RootSSI invalid load - no hint", (callback) => {
  const id = `ssi:${SSITypes.ROOT_SSI}:${defaultDomain}:${defaultSpecificString}::${defaultVersion}`
  let rootSSI
  try {
    rootSSI = RootSSI.createRootSSI(id);
  }
  catch (error) {
    assert.true(rootSSI === undefined);
    callback()
  }
});

assert.callback("RootSSI invalid load - hint invalid", (callback) => {
  const id = `ssi:${SSITypes.ROOT_SSI}:${defaultDomain}:${defaultSpecificString}::{"chainCode":undefined,"nodePosition":undefined}`
  let rootSSI
  try {
    rootSSI = RootSSI.createRootSSI(id);
  }
  catch (error) {
    assert.true(rootSSI === undefined);
    callback()
  }
});