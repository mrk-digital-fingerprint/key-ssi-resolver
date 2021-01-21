const crypto = require('crypto')
const KeySSIMixin = require("../KeySSIMixin");
const LeafSSI = require("./LeafSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

const SALT_KEY = 'salt'
const CURRENT_NODE_POSITION_KEY = 'currentNodePosition'
const INITIAL_NODE_POSITION = 0

function NodeSSI(identifier) {
    KeySSIMixin(this);
    const self = this;
    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    let _latestChildNodePosition = 0

    self.getSalt = () => {
        return crypto.randomBytes(crypto.randomInt(32, 64)).toString('hex')
    }

    self.getChildHint = (salt) => {
        const childHint = {}
        childHint[SALT_KEY] = this.getSalt()
        childHint[CURRENT_NODE_POSITION_KEY] = `${_hintObject[CURRENT_NODE_POSITION_KEY]}${_latestChildNodePosition}`
        return childHint
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
            vn = 'v0';
        }
        if (typeof hint === "function") {
            callback = hint;
            hint = undefined;
        }

        // Root of roots
        if (typeof privateKey === "undefined") {
            // generates with secp256k1
            cryptoRegistry.getKeyPairGenerator(self)().generateKeyPair((err, publicKey, privateKey) => {
                if (err) {
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed generate private/public key pair`, err));
                }
                privateKey = cryptoRegistry.getEncodingFunction(self)(privateKey);
                // TODO: add public key?
                // publicKey = cryptoRegistry.getEncodingFunction(self)(publicKey);
                const initialHintObject = {}
                initialHintObject[SALT_KEY] = this.getSalt()
                initialHintObject[CURRENT_NODE_POSITION_KEY] = INITIAL_NODE_POSITION

                self.load(SSITypes.TREE_SSI, dlDomain, privateKey, '', vn, JSON.stringify(initialHintObject));
                if(callback) {
                    callback(undefined, self);
                }
            });
        } else {
            self.load(SSITypes.TREE_SSI, dlDomain, privateKey, '', vn, hint);
            if(callback) {
                callback(undefined, self);
            }
        }
        self.initialize = function (){
            throw Error("KeySSI already initialized");
        }
    };

    self.deriveChild = function (nodePosition) {
        const childNodeSSI = createNodeSSI();
        const privateKey = self.getPrivateKey();
        const childHint = this.getChildHint()
        // TODO - use HMAC instead of sha nesting?
        const hashFn = cryptoRegistry.getStrongHashFunction(self)
        const childNodeSpecificString = hashFn(hashFn(hashFn(privateKey) + _hintObject[SALT_KEY]) + childHint[CURRENT_NODE_POSITION_KEY])
        // const publicKey = cryptoRegistry.getDerivePublicKeyFunction(self)(privateKey, "raw");
        // const subtypeControl = cryptoRegistry.getHashFunction(self)(publicKey);
        childNodeSSI.load(SSITypes.TREE_SSI, self.getDLDomain(), childNodeSpecificString, '', self.getVn(), JSON.stringify(childHint))
        _latestChildNodePosition++
        return childNodeSSI;
    };

    self.derive = function () {
        const leafSSI = LeafSSI.createLeafSSI();
        const privateKey = self.getPrivateKey();
        const publicKey = cryptoRegistry.getDerivePublicKeyFunction(self)(privateKey, "raw");
        const subtypeControl = cryptoRegistry.getHashFunction(self)(publicKey);
        leafSSI.load(SSITypes.LEAF_SSI, self.getDLDomain(), '', subtypeControl, self.getVn(), self.getHint());
        return leafSSI;
    };

    self.getPrivateKey = function (format) {
        let validSpecificString = self.getSpecificString();
        if(validSpecificString === undefined){
            throw Error("Operation requested on an invalid NodeSSI. Initialise first")
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

    self.sign = function (data) {
        return cryptoRegistry.getSignFunction(self)(data, self.getPrivateKey());
    }

    self.getEncryptionKey = function () {
        return self.derive().getEncryptionKey();
    };
}

function createNodeSSI(identifier) {
    return new NodeSSI(identifier);
}

module.exports = {
    createNodeSSI
};