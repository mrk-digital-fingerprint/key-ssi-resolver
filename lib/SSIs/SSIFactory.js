const KeySSI = require("./KeySSIs/KeySSI");

function SSIFactory() {
    const registry = {};

    this.registerFactory = (typeName, vn, derivedType, functionFactory) => {
        if (typeof derivedType === "function") {
            functionFactory = derivedType;
            derivedType = undefined;
        }
        registry[typeName] = {derivedType, functionFactory};
    };

    this.createKeySSI = (identifier, typeName) => {
        if (identifier.includes(":")) {
            KeySSI.autoLoad(identifier);
            typeName = KeySSI.subtype;
        } else {
            typeName = identifier;
            identifier = undefined;
        }

        return registry[typeName].functionFactory(identifier);
    };

    this.getRelatedType = (keySSI, otherType, callback) => {
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
}

module.exports.createSSIFactory = () => {
    return new SSIFactory();
};