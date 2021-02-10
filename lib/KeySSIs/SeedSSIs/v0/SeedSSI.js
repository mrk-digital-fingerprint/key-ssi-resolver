const KeySSIMixin = require("../../KeySSIMixin");
const SSITypes = require("../../SSITypes");
const cryptoRegistry = require("../../CryptoAlgorithmsRegistry");

const SReadSSI = require("./SReadSSI");
const {V0} = require("./seedSSIConstants")

function SeedSSI(identifier) {
    KeySSIMixin(this);
    const self = this;
    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.initialize = function (dlDomain, privateKey, control, vn, hint, callback) {
        if (typeof privateKey === "function") {
            callback = privateKey;
            privateKey = undefined;
        }
        if (typeof control === "function") {
            callback = control;
            control = undefined;
        }
        if (typeof vn === "function") {
            callback = vn;
            vn = V0;
        }
        if (typeof hint === "function") {
            callback = hint;
            hint = undefined;
        }

        if (typeof privateKey === "undefined") {
            cryptoRegistry.getKeyPairGenerator(self)().generateKeyPair((err, publicKey, privateKey) => {
                if (err) {
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed generate private/public key pair`, err));
                }
                privateKey = cryptoRegistry.getEncodingFunction(self)(privateKey);
                self.load(SSITypes.SEED_SSI, dlDomain, privateKey, '', vn, hint);
                if(callback) {
                    callback(undefined, self);
                }
            });
        } else {
            self.load(SSITypes.SEED_SSI, dlDomain, privateKey, '', vn, hint);
            if(callback) {
                callback(undefined, self);
            }
        }
        self.initialize = function (){
            throw Error("KeySSI already initialized");
        }
    };

    self.derive = function () {
        const sReadSSI = SReadSSI.createSReadSSI();
        const privateKey = self.getPrivateKey();
        const sreadSpecificString = cryptoRegistry.getHashFunction(self)(privateKey);
        const publicKey = cryptoRegistry.getDerivePublicKeyFunction(self)(privateKey, "raw");
        const subtypeControl = cryptoRegistry.getHashFunction(self)(publicKey);
        sReadSSI.load(SSITypes.SREAD_SSI, self.getDLDomain(), sreadSpecificString, subtypeControl, self.getVn(), self.getHint());
        return sReadSSI;
    };

    self.getPrivateKey = function (format) {
        let validSpecificString = self.getSpecificString();
        if(validSpecificString === undefined){
            throw Error("Operation requested on an invalid SeedSSI. Initialise first")
        }
        let privateKey = cryptoRegistry.getDecodingFunction(self)(validSpecificString);
        if (format === "pem") {
            const pemKeys = cryptoRegistry.getKeyPairGenerator(self)().getPemKeys(privateKey, self.getPublicKey("raw"));
            privateKey = pemKeys.privateKey;
        }
        return privateKey;
    }

    self.getPublicKey = function (format) {
        return cryptoRegistry.getDerivePublicKeyFunction(self)(self.getPrivateKey(), format);
    }

    self.getEncryptionKey = function () {
        return self.derive().getEncryptionKey();
    };
}

function createSeedSSI(identifier) {
    return new SeedSSI(identifier);
}

module.exports = {
    createSeedSSI
};