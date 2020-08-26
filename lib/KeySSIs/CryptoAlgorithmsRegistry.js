const crypto = require("pskcrypto");
const SSITypes = require("./SSITypes");
const algorithms = {};

function CryptoAlgorithmsRegistry() {
}

function registerCryptoFunction(keySSIType, vn, algorithmType, cryptoFunction) {
    if (typeof algorithms[keySSIType] !== "undefined" && typeof algorithms[vn] !== "undefined" && typeof algorithms[vn][algorithmType] !== "undefined") {
        throw Error(`A ${algorithmType} is already registered for version ${vn}`);
    }
    if (typeof algorithms[keySSIType] === "undefined") {
        algorithms[keySSIType] = {};
    }

    if (typeof algorithms[keySSIType][vn] === "undefined") {
        algorithms[keySSIType][vn] = {};
    }

    algorithms[keySSIType][vn][algorithmType] = cryptoFunction;
}

CryptoAlgorithmsRegistry.prototype.registerHashFunction = (keySSIType, vn, hashFunction) => {
    registerCryptoFunction(keySSIType, vn, 'hash', hashFunction);
};

CryptoAlgorithmsRegistry.prototype.getHashFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].hash;
};

CryptoAlgorithmsRegistry.prototype.registerKeyDerivationFunction = (keySSIType, vn, keyDerivationFunction) => {
    registerCryptoFunction(keySSIType, vn, 'keyDerivation', keyDerivationFunction);
};

CryptoAlgorithmsRegistry.prototype.getKeyDerivationFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].keyDerivation;
};

CryptoAlgorithmsRegistry.prototype.registerEncryptionFunction = (keySSIType, vn, encryptionFunction) => {
    registerCryptoFunction(keySSIType, vn, 'encryption', encryptionFunction);
};

CryptoAlgorithmsRegistry.prototype.getEncryptionFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].encryption;
};

CryptoAlgorithmsRegistry.prototype.registerDecryptionFunction = (keySSIType, vn, decryptionFunction) => {
    registerCryptoFunction(keySSIType, vn, 'decryption', decryptionFunction);
};

CryptoAlgorithmsRegistry.prototype.getDecryptionFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].decryption;
};

CryptoAlgorithmsRegistry.prototype.registerEncodingFunction = (keySSIType, vn, encodingFunction) => {
    registerCryptoFunction(keySSIType, vn, 'encoding', encodingFunction);
};

CryptoAlgorithmsRegistry.prototype.getEncodingFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].encoding;
};

CryptoAlgorithmsRegistry.prototype.registerDecodingFunction = (keySSIType, vn, decodingFunction) => {
    registerCryptoFunction(keySSIType, vn, 'decoding', decodingFunction);
};

CryptoAlgorithmsRegistry.prototype.getDecodingFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].decoding;
};

CryptoAlgorithmsRegistry.prototype.registerKeyPairGenerator = (keySSIType, vn, keyPairGenerator) => {
    registerCryptoFunction(keySSIType, vn, 'keyPairGenerator', keyPairGenerator);
};

CryptoAlgorithmsRegistry.prototype.getKeyPairGenerator = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].keyPairGenerator;
};

CryptoAlgorithmsRegistry.prototype.registerSignFunction = (keySSIType, vn, signFunction) => {
    registerCryptoFunction(keySSIType, vn, 'sign', signFunction);
};

CryptoAlgorithmsRegistry.prototype.getSignFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].sign;
};

CryptoAlgorithmsRegistry.prototype.registerVerifyFunction = (keySSIType, vn, verifyFunction) => {
    registerCryptoFunction(keySSIType, vn, 'verify', verifyFunction);
};

CryptoAlgorithmsRegistry.prototype.getVerifyFunction = (keySSI) => {
    return algorithms[keySSI.getName()][keySSI.getVn()].verify;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                      Registering cryptographic functions for KeySSIs version v0                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerHashFunction(SSITypes[keySSIType], 'v0', (data) => {
        return crypto.hash('sha256', data, 'hex');
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerHashFunction(SSITypes[keySSIType], 'v0', (data) => {
        return crypto.hash('sha256', data, 'hex');
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerKeyDerivationFunction(SSITypes[keySSIType], 'v0', (password, iterations) => {
        return crypto.deriveKey("aes-256-gcm", password, iterations);
    });
}
for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerEncryptionFunction(SSITypes[keySSIType], 'v0', (plainData, encryptionKey, options) => {
        const pskEncryption = crypto.createPskEncryption('aes-256-gcm');
        return pskEncryption.encrypt(plainData, encryptionKey, options);
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerDecryptionFunction(SSITypes[keySSIType], 'v0', (encryptedData, decryptionKey, authTagLength, options) => {
        const pskEncryption = crypto.createPskEncryption('aes-256-gcm');
        return pskEncryption.decrypt(encryptedData, decryptionKey, authTagLength, options);
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerEncodingFunction(SSITypes[keySSIType], 'v0', (data) => {
        return crypto.pskBase58Encode(data);
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerDecodingFunction(SSITypes[keySSIType], 'v0', (data) => {
        return crypto.pskBase58Decode(data);
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerKeyPairGenerator(SSITypes[keySSIType], 'v0', () => {
        return crypto.createKeyPairGenerator();
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerSignFunction(SSITypes[keySSIType], 'v0', (data, privateKey) => {
        return crypto.sign('sha256', data, privateKey);
    });
}

for (let keySSIType in SSITypes) {
    CryptoAlgorithmsRegistry.prototype.registerVerifyFunction(SSITypes[keySSIType], 'v0', (data, publicKey, signature) => {
        return crypto.verify('sha256', data, publicKey, signature);
    });
}

module.exports = new CryptoAlgorithmsRegistry();