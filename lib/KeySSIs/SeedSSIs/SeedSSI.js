const KeySSIMixin = require("../KeySSIMixin");
const SReadSSI = require("./SReadSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

function SeedSSI(identifier) {
    KeySSIMixin(this);
    const self = this;
    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.getName = () => {
        return SSITypes.SEED_SSI;
    };

    self.initialize = function (dlDomain, privateKey, control, vn, hint, callback){
        let subtypeSpecificString = privateKey;

        if (typeof subtypeSpecificString === "undefined") {
            return cryptoRegistry.getKeyPairGenerator(self)().generateKeyPair((err, publicKey, privateKey) => {
                if (err) {
                    return callback(err);
                }
                subtypeSpecificString = cryptoRegistry.getEncodingFunction(self)(privateKey);
                self.load(SSITypes.SEED_SSI, dlDomain, subtypeSpecificString, '', vn, hint);
                callback(undefined, self);
            });
        }
        self.load(SSITypes.SEED_SSI, dlDomain, subtypeSpecificString, '', vn, hint);
        callback(undefined, self);
    };

    self.derive = function() {
        const sReadSSI = SReadSSI.createSReadSSI();
        const sreadSpecificString = '';
        const privateKey = self.getPrivateKey();
        const publicKey = cryptoRegistry.getDerivePublicKeyFunction(self)(privateKey);
        const subtypeControl = cryptoRegistry.getHashFunction(self)(publicKey);
        sReadSSI.load(SSITypes.SREAD_SSI, self.getDLDomain(), sreadSpecificString, subtypeControl, self.getVn(), self.getHint());
        return sReadSSI;
    };

    self.getPrivateKey = function (format){
        let privateKey = cryptoRegistry.getDecodingFunction(self)(self.getSpecificString());
        if(format === "pem"){
            const pemKeys = cryptoRegistry.getKeyPairGenerator(self)().getPemKeys(privateKey, self.getPublicKey("raw"));
            privateKey = pemKeys.privateKey;
        }
        return privateKey;
    }

    self.getPublicKey = function (format){
      return cryptoRegistry.getDerivePublicKeyFunction(self)(self.getPrivateKey(), format);
    }

    self.getEncryptionKey = function() {
        return self.derive().getEncryptionKey();
    };
}

function createSeedSSI(identifier) {
    return new SeedSSI(identifier);
}

module.exports = {
    createSeedSSI
};