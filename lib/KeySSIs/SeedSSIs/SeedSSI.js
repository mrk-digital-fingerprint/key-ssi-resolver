const KeySSIMixin = require("../KeySSIMixin");
const SReadSSI = require("./SReadSSI");
const SSITypes = require("../SSITypes");

function SeedSSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.initialize = (dlDomain, privateKey, publicKey, vn, hint, callback) => {
        this.subtype = SSITypes.SEED_SSI;
        this.dlDomain = dlDomain;
        this.vn = vn || 'v0';
        this.control = '';
        this.hint = hint;
        if (typeof privateKey === "undefined") {
            this.cryptoRegistry.getKeyPairGenerator(this.vn)().generateKeyPair((err, publicKey, privateKey) => {
                if (err) {
                    return callback(err);
                }
                this.subtypeSpecificString = privateKey;
                callback(undefined, this);
            });
        }
    };

    this.derive = () => {
        const sReadSSI = SReadSSI.createSReadSSI();
        const subtypeKey = this.cryptoRegistry.getHashFunction(this.vn)(this.subtypeSpecificString);
        const publicKey = this.cryptoRegistry.getKeyPairGenerator(this.vn)().getPublicKey(this.subtypeSpecificString);
        const subtypeControl = this.cryptoRegistry.getHashFunction(this.vn)(publicKey);
        sReadSSI.load(SSITypes.SREAD_SSI, this.dlDomain, subtypeKey, subtypeControl, this.vn, this.hint);
        return sReadSSI;
    };

    this.getEncryptionKey = () => {
        return this.derive().getEncryptionKey();
    };
}

function createSeedSSI(identifier) {
    return new SeedSSI(identifier);
}

module.exports = {
    createSeedSSI
};