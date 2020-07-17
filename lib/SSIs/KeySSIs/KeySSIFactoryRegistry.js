let registry = {};

function KeySSIFactory() {

}

KeySSIFactory.prototype.getRelatedType = (keySSI, otherType, callback) => {
    let localKeySSI = keySSI;
    let currentEntry = registry[localKeySSI.getName()];
    while (typeof currentEntry.derivedType !== "undefined") {
        if (currentEntry.derivedType === otherType) {
            return callback(undefined, localKeySSI.derive());
        }
        localKeySSI = localKeySSI.derive();
        currentEntry = registry[currentEntry.derivedType];
    }

    return $$.securityContext.getRelatedType(keySSI, otherType, callback);
};

KeySSIFactory.prototype.registerFactory = (typeName, vn, derivedType, functionFactory) => {
    if (typeof derivedType === "function") {
        functionFactory = derivedType;
        derivedType = undefined;
    }
    registry[typeName] = {derivedType, functionFactory};
};

module.exports = KeySSIFactory;