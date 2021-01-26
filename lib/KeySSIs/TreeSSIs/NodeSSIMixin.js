const crypto = require('crypto')
const base58 = require('bs58');
const Buffer = require

const {CHAINCODE_KEY, NODE_POSITION_KEY, EXPIRED_AT_KEY} = require("./treeSSIConstants");
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
        // TODO: create HMAC in crypto registry
        const hmac = crypto.createHmac('blake2b512', chainCode)
        const hexDigest = hmac.update(parentPrivateKey.toString('hex').concat(position)).digest('hex')
        return cryptoRegistry.getEncodingFunction(target)(hexDigest.substring(0,64), 'hex')
    }

    target._deriveChild = function (childNodeFactory, newNodePosition) {
        const childNodeSSI = childNodeFactory();
        const childPosition = newNodePosition || target.getNextChildNodePosition()
        const childNodeSpecificString = target.childPrivateKeyDerivation(childPosition)

        const childHint = {}
        const hash = cryptoRegistry.getHashFunction(target)
        childHint[CHAINCODE_KEY] = hash(this.getChainCode() + childPosition)
        childHint[NODE_POSITION_KEY] = childPosition
        
        childNodeSSI.load(SSITypes.NODE_SSI, target.getDLDomain(), childNodeSpecificString, '', target.getVn(), JSON.stringify(childHint))
        _childCount++
        return childNodeSSI;
    };

    target.derive = function (expiredAt) {
        const leafSSI = LeafSSI.createLeafSSI();
        const controlString = target.getPubKeyBase58Encoded();
        let leafHint
        if (typeof expiredAt === 'number') {
            const hint = {}
            hint[EXPIRED_AT_KEY] = expiredAt
            leafHint = JSON.stringify(hint);
        }
        leafSSI.load(SSITypes.LEAF_SSI, target.getDLDomain(), '', controlString, target.getVn(), leafHint);
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

    target.verify = (data, signature) => {
        return cryptoRegistry.getVerifyFunction(target)(data, target.getPublicKey(), signature);
    };

    target.getEncryptionKey = function () {
        return target.derive().getEncryptionKey();
    };

    target.getPubKeyBase58Encoded = (pubKey = target.getPublicKey()) => {
        return base58.encode($$.Buffer.from(pubKey, 'ascii')).toString()
    }
}

module.exports = NodeSSIMixin;
