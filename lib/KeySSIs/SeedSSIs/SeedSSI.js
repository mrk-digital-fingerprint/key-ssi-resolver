const KeySSIMixin = require("../KeySSIMixin");
const SReadSSI = require("./SReadSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

function SeedSSI(identifier) {
    KeySSIMixin(this);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    this.getName = () => {
        return SSITypes.SEED_SSI;
    };

    this.initialize = function (dlDomain, privateKey, publicKey, vn, hint, callback){
        let subtypeSpecificString = privateKey;

        if (typeof subtypeSpecificString === "undefined") {
            return cryptoRegistry.getKeyPairGenerator(this)().generateKeyPair((err, publicKey, privateKey) => {
                if (err) {
                    return callback(err);
                }
                subtypeSpecificString = privateKey;
                this.load(SSITypes.SEED_SSI, dlDomain, subtypeSpecificString, '', vn, hint);
                callback(undefined, this);
            });
        }
        this.load(SSITypes.SEED_SSI, dlDomain, subtypeSpecificString, '', vn, hint);
        callback(undefined, this);
    };

    this.derive = function() {
        const sReadSSI = SReadSSI.createSReadSSI();
        const subtypeKey = cryptoRegistry.getHashFunction(this)(this.getSpecificString());
        const publicKey = cryptoRegistry.getKeyPairGenerator(this)().getPublicKey(this.getSpecificString());
        const subtypeControl = cryptoRegistry.getHashFunction(this)(publicKey);
        sReadSSI.load(SSITypes.SREAD_SSI, this.getDLDomain(), subtypeKey, subtypeControl, this.getVn(), this.getHint());
        return sReadSSI;

        /*
        const sReadSSI = SReadSSI.createSReadSSI();
        const subtypeKey = cryptoRegistry.getHashFunction(this)(this.subtypeSpecificString);
        const publicKey = cryptoRegistry.getKeyPairGenerator(this)().getPublicKey(this.subtypeSpecificString);
        const subtypeControl = cryptoRegistry.getHashFunction(this)(publicKey);
        sReadSSI.load(SSITypes.SREAD_SSI, this.dlDomain, subtypeKey, subtypeControl, this.vn, this.hint);
        return sReadSSI;
        * */
    };

    let getEncryptionKey = this.getEncryptionKey;

    this.getEncryptionKey = function() {
        return this.derive().getEncryptionKey();
    };
}

function createSeedSSI(identifier) {
    return new SeedSSI(identifier);
}

module.exports = {
    createSeedSSI
};