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

CryptoAlgorithmsRegistry.prototype.registerKeyPairGeneratorFunction = (vn, keyPairGenerator) => {
    registerCryptoFunction(vn, 'keyPairGenerator', keyPairGenerator);
};

CryptoAlgorithmsRegistry.prototype.getKeyPairGeneratorFunction = (vn) => {
    return algorithms[vn].keyPairGenerator;
};

CryptoAlgorithmsRegistry.prototype.registerHashFunction('v0', (data, encoding) => {
    return crypto.hash('sha256', data, encoding);
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

CryptoAlgorithmsRegistry.prototype.registerKeyPairGeneratorFunction('v0', (options, callback) => {
    crypto.generateKeyPair(options, callback);
});

module.exports = new CryptoAlgorithmsRegistry();