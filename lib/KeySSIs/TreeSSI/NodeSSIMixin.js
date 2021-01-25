const crypto = require('crypto')
const KeySSIMixin = require("../KeySSIMixin");
const LeafSSI = require("./LeafSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

const CHAINCODE_KEY = 'chainCode'
const NODE_POSITION_KEY = 'nodePosition'
const INITIAL_NODE_POSITION = '0'

function NodeSSIMixin(target) {
    KeySSIMixin(target);
    let _childCount = 0
    let _chainCode


    self.isHintValid = () => {
      return _hintObject[CHAINCODE_KEY] && _hintObject[NODE_POSITION_KEY] 
    }

    self.getChildCount = () => {
      return _childCount
    }

    self.setChildCount = (childCount) => {
      return _childCount = childCount
    }

    self.incrementChildCount = () => {
      return _childCount++
    }

    self.getChainCode = () => {
        return _chainCode
    }

    self.setChainCode = (chainCode) => {
        _chainCode = chainCode
    }

    self.getNodePosition = () => {
        return initialHintObject[NODE_POSITION_KEY]
    }

    self.getNextChildNodePosition = () => {
        return `${self.getNodePosition()}-${_childCount + 1}`
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
                initialHintObject[CHAINCODE_KEY] = this.generateChainCode()
                initialHintObject[NODE_POSITION_KEY] = INITIAL_NODE_POSITION

                self.load(SSITypes.TREE_SSI, dlDomain, privateKey, control, vn, JSON.stringify(initialHintObject));
                if(callback) {
                    callback(undefined, self);
                }
            });
        } else {
            self.load(SSITypes.TREE_SSI, dlDomain, privateKey, control, vn, hint);
            if(callback) {
                callback(undefined, self);
            }
        }
        self.initialize = function (){
            throw Error("KeySSI already initialized");
        }
    };

    self.childPrivateKeyDerivation = (position, parentPrivateKey = self.getPrivateKey(), chainCode = self.getChainCode()) => {
        // const hashFn = cryptoRegistry.getStrongHashFunction(self)
        // TODO: create HMAC in crypto registry
        const hmac = crypto.createHmac('blake2b512', chainCode)
        return hmac.update(parentPrivateKey.concat(position)).digest('hex').substr(0, 64)
    }

    self.deriveChild = function (nodePosition) {
        const childNodeSSI = createNodeSSI();
        const childPosition = self.getNextChildNodePosition()
        const childNodeSpecificString = self.childPrivateKeyDerivation(childPosition)

        const childHint = {}
        const hash = cryptoRegistry.getHashFunction(self)
        childHint[CHAINCODE_KEY] = hash(this.getChainCode() + childPosition)
        childHint[NODE_POSITION_KEY] = childPosition
        
        childNodeSSI.load(SSITypes.TREE_SSI, self.getDLDomain(), childNodeSpecificString, '', self.getVn(), JSON.stringify(childHint))
        _childCount++
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

    self.getVerificationKey = (data, signature) => {
        return cryptoRegistry.getVerifyFunction(self)(data, self.getPublicKey(), signature);
    };

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