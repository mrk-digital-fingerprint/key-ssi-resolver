require("../../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../../lib/KeySSIs/SSITypes.js");
const RootSSI = require("../../../lib/KeySSIs/TreeSSIs/RootSSI");

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

      // specific string
      assert.true(typeof rSSI.getSpecificString() === 'string');
      assert.true(rSSI.getSpecificString().length === 44);
      // control string
      assert.true(!!rSSI.getControlString() === false);

      // version
      assert.true(rSSI.getVn() === defaultVersion);

      // hint
      assert.true(rSSI.isHintValid() === true);
      assert.true(typeof rSSI.getChainCode() === 'string');
      assert.true(rSSI.getChainCode().length > 1);
      assert.true(rSSI.getNodePosition() === '0');
  
      callback();
  })
});


assert.callback("RootSSI sucessfull load - all attributes valid", (callback) => {
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
  console.log('rootSSI.getChainCode()', rootSSI.getChainCode())
  assert.true(rootSSI.isHintValid() === true);
  assert.true(typeof rootSSI.getChainCode() === 'string');
  assert.true(rootSSI.getChainCode().length > 1);
  assert.true(rootSSI.getNodePosition() === '0');

  callback();
});

assert.callback("RootSSI invalid load - no hint", (callback) => {
  const id = `ssi:${SSITypes.ROOT_SSI}:${defaultDomain}:${defaultSpecificString}::${defaultVersion}`
  const rootSSI = RootSSI.createRootSSI(id);
  assert.true(rootSSI.isHintValid() === false);

  callback()
});

assert.callback("RootSSI invalid load - hint invalid", (callback) => {
  const id = `ssi:${SSITypes.ROOT_SSI}:${defaultDomain}:${defaultSpecificString}::{"chainCode":undefined,"nodePosition":"0"}`
  const rootSSI = RootSSI.createRootSSI(id);
  assert.true(rootSSI.getChainCode() === undefined);
  assert.true(rootSSI.isHintValid() === false);
  
  callback()
});