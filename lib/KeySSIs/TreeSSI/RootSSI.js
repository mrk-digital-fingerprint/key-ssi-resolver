const crypto = require('crypto')
const RootSSIMixin = require("./RootSSIMixin");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

const CHAINCODE_KEY = 'chainCode'
const NODE_POSITION_KEY = 'nodePosition'
const INITIAL_NODE_POSITION = '0'

function RootSSI(identifier) {
    RootSSIMixin(this);
    const self = this;
    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.generateInitialChainCode = () => {
        return crypto.randomBytes(crypto.randomInt(32, 64)).toString('hex')
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
            vn = 'v0';
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
                initialHintObject[CHAINCODE_KEY] = this.generateInitialChainCode()
                initialHintObject[NODE_POSITION_KEY] = INITIAL_NODE_POSITION

                self.load(SSITypes.ROOT_SSI, dlDomain, privateKey, control, vn, JSON.stringify(initialHintObject));
                if(callback) {
                    callback(undefined, self);
                }
            });
        } else {
          if (!self.isHintValid()) {
            return callback(new Error('Hint provided for valid RootSSI load'))
          }
          else {
            self.load(SSITypes.ROOT_SSI, dlDomain, privateKey, control, vn, hint);
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

function createRootSSI(identifier) {
    return new RootSSI(identifier);
}

module.exports = {
    createRootSSI
};