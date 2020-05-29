'use strict';

const testUtils = require('./utils');
const dc = require("double-check");
const assert = dc.assert;

const DSU_REPRESENTATIONS = require('../lib/constants').BUILTIN_DSU_REPR;

let keyDidResolver;
let favouriteEndpoint;

testUtils.didResolverFactory({testFolder: 'create_bar_test_folder', testName: 'Create BAR test'}, (err, result) => {
    assert.true(err === null || typeof err === 'undefined', 'Failed to initialize test');
    keyDidResolver = result.keyDidResolver;
    favouriteEndpoint = result.favouriteEndpoint
    runTest(result.doneCallback);
});

function runTest(callback) {
    keyDidResolver.createDSU(DSU_REPRESENTATIONS.Bar, {
        favouriteEndpoint
    }, (err, dsu) => {
        assert.true(typeof err === 'undefined', 'No error while creating the DSU');
        assert.true(dsu.constructor.name === 'Archive', 'DSU has the correct class');

        dsu.writeFile('/something/something/darkside/my-file.txt', 'Lorem Ipsum', (err, hash) => {
            console.log(err);
            assert.true(typeof err === 'undefined', 'DSU is writable');

            dsu.readFile('/something/something/darkside/my-file.txt', (err, data) => {
                console.log(err);
                console.log(data.toString());

                assert.true(typeof err === 'undefined', 'DSU is readable');
                assert.true(data.toString() === 'Lorem Ipsum', 'File was read correctly');

                callback();
            })
        })
    });
}


