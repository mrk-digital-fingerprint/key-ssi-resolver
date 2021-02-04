const crypto = require('crypto')
const base58 = require('bs58');
const Buffer = require

const {CHAINCODE_KEY, NODE_POSITION_KEY, EXPIRED_AT_KEY} = require("./treeSSIConstants");
const KeySSIMixin = require("../KeySSIMixin");
const LeafSSI = require("./LeafSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");



function NodeSSIMixin(target, identifier) {
    KeySSIMixin(target);

    let _childCount = 0

    target.isValid = () => {
        return target.isHintValid()
    }

    target.isHintValid = () => {
        const hint = target.getHintObject() || {}
        return !!hint[NODE_POSITION_KEY]
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
        const hint = target.getHintObject()
        return cryptoRegistry.getDecodingFunction(target)(hint[CHAINCODE_KEY])
    }

    target.getNodePosition = () => {
        const hint = target.getHintObject() || {}
        return hint[NODE_POSITION_KEY]
    }

    target.getNextChildNodePosition = () => {
        return `${target.getNodePosition()}-${_childCount + 1}`
    }

    target.childPrivateKeyChainCodeDerivation = (childPosition, parentPrivateKey = target.getPrivateKey(), parentChainCode = target.getChainCode()) => {
        // TODO: create HMAC in crypto registry
        const hmac = crypto.createHmac('blake2b512', parentChainCode)
        const hexDigest = hmac.update('0'.concat(parentPrivateKey.toString('hex').concat(childPosition))).digest('hex')

        const childPrivateKey = hexDigest.substring(0,64);
        const childChainCode = hexDigest.substring(64)
        const b58 = cryptoRegistry.getEncodingFunction(target)

        return [b58(childPrivateKey, 'hex'), b58(childChainCode, 'hex')]
    }

    target._deriveChild = function (childNodeFactory, newNodePosition) {
        const childNodeSSI = childNodeFactory();
        const childPosition = newNodePosition || target.getNextChildNodePosition()
        const [childPrivateKey, childChainCode] = target.childPrivateKeyChainCodeDerivation(childPosition)

        const childHint = {}
        childHint[CHAINCODE_KEY] = childChainCode
        childHint[NODE_POSITION_KEY] = childPosition

        childNodeSSI.load(SSITypes.NODE_SSI, target.getDLDomain(), childPrivateKey, '', target.getVn(), JSON.stringify(childHint))
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

    if (typeof identifier !== "undefined") {
        target.autoLoad(identifier);
        if (!target.isValid()) {
            throw new Error(`Invalid KeySSI identifier: ${identifier}`)
        }
    }
}

module.exports = NodeSSIMixin;
