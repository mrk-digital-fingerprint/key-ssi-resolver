const createSecretSSI = require("./SecretSSIs/SecretSSI").createSecretSSI;
const createAnchorSSI = require("./SecretSSIs/AnchorSSI").createAnchorSSI;
const createReadSSI = require("./SecretSSIs/ReadSSI").createReadSSI;
const createPublicSSI = require("./SecretSSIs/PublicSSI").createPublicSSI;
const createZaSSI = require("./SecretSSIs/ZaSSI").createZaSSI;
const createSeedSSI = require("./SeedSSIs/SeedSSI").createSeedSSI;
const createWalletSSI = require("./OtherKeySSIs/WalletSSI").createWalletSSI;
const createSReadSSI = require("./SeedSSIs/SReadSSI").createSReadSSI;
const createSZaSSI = require("./SeedSSIs/SZaSSI").createSZaSSI;
const createPasswordSSI = require("./ConstSSIs/PasswordSSI").createPasswordSSI;
const createArraySSI = require("./ConstSSIs/ArraySSI").createArraySSI;
const createConstSSI = require("./ConstSSIs/ConstSSI").createConstSSI;
const createCZaSSI = require("./ConstSSIs/CZaSSI").createCZaSSI;
const createHashLinkSSI = require("./OtherKeySSIs/HashLinkSSI").createHashLinkSSI;

const SSITypes = require("./SSITypes");

const registry = {};

function KeySSIFactory() {
}

KeySSIFactory.prototype.registerFactory = (typeName, vn, derivedType, functionFactory) => {
    if (typeof derivedType === "function") {
        functionFactory = derivedType;
        derivedType = undefined;
    }

    if (typeof registry[typeName] !== "undefined") {
        throw Error(`A function factory for KeySSI of type ${typeName} is already registered.`);
    }

    registry[typeName] = {derivedType, functionFactory};
};

/*
* @param = identifierOrTypeName
**/
KeySSIFactory.prototype.create = (identifier) => {
    if (typeof identifier === "undefined") {
        throw Error("An SSI should be provided");
    }

    const KeySSIMixin = require("./KeySSIMixin");
    KeySSIMixin.autoLoad(identifier);
    const typeName = KeySSIMixin.getName();

console.log("Looking for....", typeName);
    return registry[typeName].functionFactory(identifier);
};

KeySSIFactory.prototype.createType = (typeName)=>{
    return registry[typeName].functionFactory();
}

KeySSIFactory.prototype.getRelatedType = (keySSI, otherType, callback) => {
    if (keySSI.getName() === otherType) {
        return keySSI;
    }
    let currentEntry = registry[otherType];
    if (typeof currentEntry === "undefined") {
        return callback(Error(`${otherType} is not a registered KeySSI type.`))
    }

    while (typeof currentEntry.derivedType !== "undefined") {
        if (currentEntry.derivedType === keySSI.getName()) {
            return $$.securityContext.getRelatedSSI(keySSI, otherType, callback);
        }
        currentEntry = registry[currentEntry.derivedType];
    }

    let derivedKeySSI;
    try {
        derivedKeySSI = getDerivedType(keySSI, otherType);
    } catch (err){
        return callback(err);
    }

    callback(undefined, derivedKeySSI);
};

KeySSIFactory.prototype.getAnchorType = (keySSI) => {
    let localKeySSI = keySSI;
    while (typeof registry[localKeySSI.getName()].derivedType !== "undefined") {
        localKeySSI = localKeySSI.derive();
    }
    return localKeySSI;
};

const getDerivedType = (keySSI, derivedTypeName) => {
    let localKeySSI = keySSI;
    let currentEntry = registry[localKeySSI.getName()];
    while (typeof currentEntry.derivedType !== "undefined") {
        if (currentEntry.derivedType === derivedTypeName) {
            return localKeySSI.derive();
        }
        localKeySSI = localKeySSI.derive();
        currentEntry = registry[currentEntry.derivedType];
    }

    throw Error(`${derivedTypeName} is not a valid KeySSI Type`);
};

KeySSIFactory.prototype.registerFactory(SSITypes.SECRET_SSI, 'v0', SSITypes.ANCHOR_SSI, createSecretSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.ANCHOR_SSI, 'v0', SSITypes.READ_SSI, createAnchorSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.READ_SSI, 'v0', SSITypes.PUBLIC_SSI, createReadSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.PUBLIC_SSI, 'v0', SSITypes.ZERO_ACCESS_SSI, createPublicSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.ZERO_ACCESS_SSI, 'v0', undefined, createZaSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.SEED_SSI, 'v0', SSITypes.SREAD_SSI, createSeedSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.WALLET_SSI, 'v0', SSITypes.SREAD_SSI, createWalletSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.SREAD_SSI, 'v0', SSITypes.SZERO_ACCESS_SSI, createSReadSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.SZERO_ACCESS_SSI, 'v0', undefined, createSZaSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.PASSWORD_SSI, 'v0', SSITypes.CONST_SSI, createPasswordSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.ARRAY_SSI, 'v0', SSITypes.CONST_SSI, createArraySSI);
KeySSIFactory.prototype.registerFactory(SSITypes.CONST_SSI, 'v0', SSITypes.CONSTANT_ZERO_ACCESS_SSI, createConstSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.CONSTANT_ZERO_ACCESS_SSI, 'v0', undefined, createCZaSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.HASH_LINK_SSI, 'v0', undefined, createHashLinkSSI);

module.exports = new KeySSIFactory();