const crypto = require('crypto')

const {CHAINCODE_KEY, NODE_POSITION_KEY} = require("./treeSSIConstants");
const KeySSIMixin = require("../KeySSIMixin");
const LeafSSI = require("./LeafSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");



function NodeSSIMixin(target) {
    KeySSIMixin(target);
    let _childCount = 0


    target.isHintValid = () => {
        const hint = target.getHintObject() || {}
        return !!hint[CHAINCODE_KEY] && !!hint[NODE_POSITION_KEY] 
    }

    target.getChildCount = () => {
        return _childCount
    }

    target.setChildCount = (childCount) => {
        return _childCount = childCount
    }

    target.incrementChildCount = () => {
        return _childCount++
    }

    target.getChainCode = () => {
        const hint = target.getHintObject() || {}
        return hint[CHAINCODE_KEY]
    }

    target.getNodePosition = () => {
        const hint = target.getHintObject() || {}
        return hint[NODE_POSITION_KEY]
    }

    target.getNextChildNodePosition = () => {
        return `${target.getNodePosition()}-${_childCount + 1}`
    }

    target.childPrivateKeyDerivation = (position, parentPrivateKey = target.getPrivateKey(), chainCode = target.getChainCode()) => {
        // const hashFn = cryptoRegistry.getStrongHashFunction(target)
        // TODO: create HMAC in crypto registry
        const hmac = crypto.createHmac('blake2b512', chainCode)
        return hmac.update(parentPrivateKey.concat(position)).digest('hex').substr(0, 64)
    }

    target.deriveChild = function (nodePosition) {
        const childNodeSSI = createNodeSSI();
        const childPosition = target.getNextChildNodePosition()
        const childNodeSpecificString = target.childPrivateKeyDerivation(childPosition)

        const childHint = {}
        const hash = cryptoRegistry.getHashFunction(target)
        childHint[CHAINCODE_KEY] = hash(this.getChainCode() + childPosition)
        childHint[NODE_POSITION_KEY] = childPosition
        
        childNodeSSI.load(SSITypes.TREE_SSI, target.getDLDomain(), childNodeSpecificString, '', target.getVn(), JSON.stringify(childHint))
        _childCount++
        return childNodeSSI;
    };

    target.derive = function () {
        const leafSSI = LeafSSI.createLeafSSI();
        const privateKey = target.getPrivateKey();
        const publicKey = cryptoRegistry.getDerivePublicKeyFunction(target)(privateKey, "raw");
        const subtypeControl = cryptoRegistry.getHashFunction(target)(publicKey);
        leafSSI.load(SSITypes.LEAF_SSI, target.getDLDomain(), '', subtypeControl, target.getVn(), target.getHint());
        return leafSSI;
    };

    target.getPrivateKey = function (format) {
        let validSpecificString = target.getSpecificString();
        if(validSpecificString === undefined){
            throw Error("Operation requested on an invalid NodeSSI. Initialise first")
        }
        let privateKey = cryptoRegistry.getDecodingFunction(target)(validSpecificString);
        if (format === "pem") {
            const pemKeys = cryptoRegistry.getKeyPairGenerator(target)().getPemKeys(privateKey, target.getPublicKey("raw"));
            privateKey = pemKeys.privateKey;
        }
        return privateKey;
    }

    target.getPublicKey = function (format) {
        return cryptoRegistry.getDerivePublicKeyFunction(target)(target.getPrivateKey(), format);
    }

    target.sign = function (data) {
        return cryptoRegistry.getSignFunction(target)(data, target.getPrivateKey());
    }

    target.getVerificationKey = (data, signature) => {
        return cryptoRegistry.getVerifyFunction(target)(data, target.getPublicKey(), signature);
    };

    target.getEncryptionKey = function () {
        return target.derive().getEncryptionKey();
    };
}

module.exports = NodeSSIMixin;
