const crypto = require('crypto')

const SSITypes = require("../../SSITypes");
const cryptoRegistry = require("../../CryptoAlgorithmsRegistry");
const {V1} = require("../../KeySSIConstants");

const {createSReadSSI} = require("./SReadSSI");
const NodeSSIMixin = require("./NodeSSIMixin");
const {CHAINCODE_KEY, NODE_POSITION_KEY, INITIAL_NODE_POSITION} = require("./seedSSIConstants");


function SeedSSI(identifier) {
    NodeSSIMixin(this, identifier);
    const self = this;

    self.generateInitialChainCode = () => {
        return cryptoRegistry.getEncodingFunction(self)(crypto.randomBytes(32))
    }

    self.deriveChild = () => {
        return self._deriveChild(createSeedSSI)
    }

    self.derive = () => {
        return self._derive(createSReadSSI)
    }

    self.initialize = function (dlDomain, privateKey, control = '', vn, hint, callback) {
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
            vn = V1;
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
                const initialHintObject = {}
                initialHintObject[CHAINCODE_KEY] = self.generateInitialChainCode()
                initialHintObject[NODE_POSITION_KEY] = INITIAL_NODE_POSITION

                self.load(SSITypes.SEED_SSI, dlDomain, privateKey, control, vn, JSON.stringify(initialHintObject));
                if(callback) {
                    callback(undefined, self);
                }
            });
        } else {
          if (!self.isHintValid()) {
            return callback(new Error('Hint provided for valid SeedSSI load is invalid.'))
          }
          else {
            self.load(SSITypes.SEED_SSI, dlDomain, privateKey, control, vn, hint);
            if(callback) {
                callback(undefined, self);
            }
          }
        }
        self.initialize = function (){
            throw Error("KeySSI already initialized");
        }
    };

}

function createSeedSSI(identifier) {
    return new SeedSSI(identifier);
}

module.exports = {
    createSeedSSI
};