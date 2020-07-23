const createSecretSSI = require("./SecretSSIs/SecretSSI").createSecretSSI;
const createAnchorSSI = require("./SecretSSIs/AnchorSSI").createAnchorSSI;
const createReadSSI = require("./SecretSSIs/ReadSSI").createReadSSI;
const createPublicSSI = require("./SecretSSIs/PublicSSI").createPublicSSI;
const createZaSSI = require("./SecretSSIs/ZaSSI").createZaSSI;
const createSeedSSI = require("./SeedSSIs/SeedSSI").createSeedSSI;
const createSReadSSI = require("./SeedSSIs/SReadSSI").createSReadSSI;
const createPasswordSSI = require("./SeedSSIs/PasswordSSI").createPasswordSSI;
const createConstSSI = require("./SeedSSIs/ConstSSI").createConstSSI;
const createSZaSSI = require("./SeedSSIs/SZaSSI").createSZaSSI;

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

KeySSIFactory.prototype.create = (identifier, typeName) => {
    if (typeof identifier === "undefined" || identifier.includes(":")) {
        const KeySSIMixin = require("./KeySSIMixin");
        KeySSIMixin.autoLoad(identifier);
        typeName = KeySSIMixin.getName();
    } else {
        typeName = identifier;
        identifier = undefined;
    }

    return registry[typeName].functionFactory(identifier);
};

KeySSIFactory.prototype.getRelatedType = (keySSI, otherType, callback) => {
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

    let localKeySSI = keySSI;
    currentEntry = registry[localKeySSI.getName()];
    while (typeof currentEntry.derivedType !== "undefined") {
        if (currentEntry.derivedType === otherType) {
            return callback(undefined, localKeySSI.derive());
        }
        localKeySSI = localKeySSI.derive();
        currentEntry = registry[currentEntry.derivedType];
    }

    callback(Error(`${otherType} is not a valid SSI Type`));
};

KeySSIFactory.prototype.getAnchorAlias = (keySSI) => {
    let localKeySSI = keySSI;
    console.log("KeySSI type", localKeySSI.getName());
    while (typeof registry[localKeySSI.getName()].derivedType !== "undefined") {
        localKeySSI = localKeySSI.derive();
    }
    return localKeySSI.getIdentifier();
};

KeySSIFactory.prototype.registerFactory(SSITypes.SECRET_SSI, 'v0', SSITypes.ANCHOR_SSI, createSecretSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.ANCHOR_SSI, 'v0', SSITypes.READ_SSI, createAnchorSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.READ_SSI, 'v0', SSITypes.PUBLIC_SSI, createReadSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.PUBLIC_SSI, 'v0', SSITypes.ZERO_ACCESS_SSI, createPublicSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.ZERO_ACCESS_SSI, 'v0', undefined, createZaSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.SEED_SSI, 'v0', SSITypes.SREAD_SSI, createSeedSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.SREAD_SSI, 'v0', SSITypes.SZERO_ACCESS_SSI, createSReadSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.PASSWORD_SSI, 'v0', SSITypes.SZERO_ACCESS_SSI, createPasswordSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.CONST_SSI, 'v0', SSITypes.SZERO_ACCESS_SSI, createConstSSI);
KeySSIFactory.prototype.registerFactory(SSITypes.SZERO_ACCESS_SSI, 'v0', undefined, createSZaSSI);

module.exports = new KeySSIFactory();