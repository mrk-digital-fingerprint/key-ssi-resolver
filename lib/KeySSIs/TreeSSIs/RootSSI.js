const crypto = require('crypto')

const NodeSSIMixin = require("./NodeSSIMixin");
const {CHAINCODE_KEY, NODE_POSITION_KEY, INITIAL_NODE_POSITION} = require("./treeSSIConstants");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

function RootSSI(identifier) {
    NodeSSIMixin(this);
    const self = this;
    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.generateInitialChainCode = () => {
        return crypto.randomBytes(crypto.randomInt(16, 32)).toString('hex')
    }

    self.deriveChild = () => {
        return self._deriveChild(createRootSSI)
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
                initialHintObject[CHAINCODE_KEY] = self.generateInitialChainCode()
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