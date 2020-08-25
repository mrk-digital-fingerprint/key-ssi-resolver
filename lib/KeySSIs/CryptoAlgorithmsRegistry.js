const crypto = require("pskcrypto");
const algorithms = {};
function CryptoAlgorithmsRegistry() {
}

function registerCryptoFunction(vn, algorithmType, cryptoFunction){
    if (typeof algorithms[vn] !== "undefined" && typeof algorithms[vn][algorithmType] !== "undefined") {
            throw Error(`A ${algorithmType} is already registered for version ${vn}`);
    }
    if (typeof algorithms[vn] === "undefined") {
        algorithms[vn] = {};
    }

    algorithms[vn][algorithmType] = cryptoFunction;
}

CryptoAlgorithmsRegistry.prototype.registerHashFunction = (vn, hashFunction) => {
    registerCryptoFunction(vn, 'hash', hashFunction);
};

CryptoAlgorithmsRegistry.prototype.getHashFunction = (vn) => {
    return algorithms[vn].hash;
};

CryptoAlgorithmsRegistry.prototype.registerKeyDerivationFunction = (vn, keyDerivationFunction) => {
    registerCryptoFunction(vn, 'keyDerivation', keyDerivationFunction);
};

CryptoAlgorithmsRegistry.prototype.getKeyDerivationFunction = (vn) => {
    return algorithms[vn].keyDerivation;
};

CryptoAlgorithmsRegistry.prototype.registerEncryptionFunction = (vn, encryptionFunction) => {
    registerCryptoFunction(vn, 'encryption', encryptionFunction);
};

CryptoAlgorithmsRegistry.prototype.getEncryptionFunction = (vn) => {
    return algorithms[vn].encryption;
};

CryptoAlgorithmsRegistry.prototype.registerDecryptionFunction = (vn, decryptionFunction) => {
    registerCryptoFunction(vn, 'decryption', decryptionFunction);
};

CryptoAlgorithmsRegistry.prototype.getDecryptionFunction = (vn) => {
    return algorithms[vn].decryption;
};

CryptoAlgorithmsRegistry.prototype.registerEncodingFunction = (vn, encodingFunction) => {
    registerCryptoFunction(vn, 'encoding', encodingFunction);
};

CryptoAlgorithmsRegistry.prototype.getEncodingFunction = (vn) => {
    return algorithms[vn].encoding;
};

CryptoAlgorithmsRegistry.prototype.registerDecodingFunction = (vn, decodingFunction) => {
    registerCryptoFunction(vn, 'decoding', decodingFunction);
};

CryptoAlgorithmsRegistry.prototype.getDecodingFunction = (vn) => {
    return algorithms[vn].decoding;
};

CryptoAlgorithmsRegistry.prototype.registerKeyPairGenerator = (vn, keyPairGenerator) => {
    registerCryptoFunction(vn, 'keyPairGenerator', keyPairGenerator);
};

CryptoAlgorithmsRegistry.prototype.getKeyPairGenerator = (vn) => {
    return algorithms[vn].keyPairGenerator;
};

CryptoAlgorithmsRegistry.prototype.registerSignFunction = (vn, signFunction) => {
    registerCryptoFunction(vn, 'sign', signFunction);
};

CryptoAlgorithmsRegistry.prototype.getSignFunction = (vn) => {
    return algorithms[vn].sign;
};

CryptoAlgorithmsRegistry.prototype.registerVerifyFunction = (vn, verifyFunction) => {
    registerCryptoFunction(vn, 'verify', verifyFunction);
};

CryptoAlgorithmsRegistry.prototype.getVerifyFunction = (vn) => {
    return algorithms[vn].sign;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                      Registering cryptographic functions for KeySSIs version v0                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

CryptoAlgorithmsRegistry.prototype.registerHashFunction('v0', (data, encoding) => {
    return crypto.hash('sha256', data, 'hex');
});

CryptoAlgorithmsRegistry.prototype.registerKeyDerivationFunction('v0', (password, iterations) => {
    return crypto.deriveKey("aes-256-gcm", password, iterations);
});

CryptoAlgorithmsRegistry.prototype.registerEncryptionFunction('v0', (plainData, encryptionKey, options) => {
    const pskEncryption = crypto.createPskEncryption('aes-256-gcm');
    return pskEncryption.encrypt(plainData, encryptionKey, options);
});

CryptoAlgorithmsRegistry.prototype.registerDecryptionFunction('v0', (encryptedData, decryptionKey, authTagLength, options) => {
    const pskEncryption = crypto.createPskEncryption('aes-256-gcm');
    return pskEncryption.decrypt(encryptedData, decryptionKey, authTagLength, options);
});

CryptoAlgorithmsRegistry.prototype.registerEncodingFunction('v0', (data) => {
    return crypto.pskBase58Encode(data);
});

CryptoAlgorithmsRegistry.prototype.registerDecodingFunction('v0', (data) => {
    return crypto.pskBase58Decode(data);
});

CryptoAlgorithmsRegistry.prototype.registerKeyPairGenerator('v0', () => {
    return crypto.createKeyPairGenerator();
});

CryptoAlgorithmsRegistry.prototype.registerSignFunction('v0', (data, privateKey) => {
    return crypto.sign('sha256', data, privateKey);
});

CryptoAlgorithmsRegistry.prototype.registerVerifyFunction('v0', (data, publicKey, signature) => {
    return crypto.verify('sha256', data, publicKey, signature);
});

module.exports = new CryptoAlgorithmsRegistry();