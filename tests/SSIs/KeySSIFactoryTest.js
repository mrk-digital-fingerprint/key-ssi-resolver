require("../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;
const SSITypes = require("../../lib/SSIs/SSITypes");

const SecretSSI = require("../../lib/SSIs/KeySSIs/SecretSSI");
const AnchorSSI = require("../../lib/SSIs/KeySSIs/AnchorSSI");
const ReadSSI = require("../../lib/SSIs/KeySSIs/ReadSSI");
const PublicSSI = require("../../lib/SSIs/KeySSIs/PublicSSI");
const ZaSSI = require("../../lib/SSIs/KeySSIs/ZaSSI");

const KeySSIFactory = require("../../lib/SSIs/KeySSIs/KeySSIFactory");
KeySSIFactory.prototype.registerFactory(SSITypes.SECRET_SSI, 'v0', SSITypes.ANCHOR_SSI, (identifier) => {
    return new SecretSSI(identifier);
});
KeySSIFactory.prototype.registerFactory(SSITypes.ANCHOR_SSI, 'v0', SSITypes.READ_SSI, (identifier) => {
    return new AnchorSSI(identifier);
});
KeySSIFactory.prototype.registerFactory(SSITypes.READ_SSI, 'v0', SSITypes.PUBLIC_SSI, (identifier) => {
    return new ReadSSI(identifier);
});
KeySSIFactory.prototype.registerFactory(SSITypes.PUBLIC_SSI, 'v0', SSITypes.ZERO_ACCESS_SSI, (identifier) => {
    return new PublicSSI(identifier);
});
KeySSIFactory.prototype.registerFactory(SSITypes.ZERO_ACCESS_SSI, 'v0', undefined, (identifier) => {
    return new ZaSSI(identifier);
});

const secretSSI = KeySSIFactory.prototype.createKeySSI(SSITypes.SECRET_SSI);
secretSSI.load(SSITypes.SECRET_SSI, "domain", "subtype specific string", "v0");

assert.callback("KeySSIFactory get related type test", (callback) => {
    KeySSIFactory.prototype.getRelatedType(secretSSI, SSITypes.PUBLIC_SSI, (err, publicSSI) => {
        if (err) {
            throw err;
        }
        assert.true(publicSSI instanceof PublicSSI);
        callback();
    });
}, 2000);