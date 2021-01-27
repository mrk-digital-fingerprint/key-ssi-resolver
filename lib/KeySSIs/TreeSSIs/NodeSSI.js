const crypto = require('crypto')
const NodeSSIMixin = require("./NodeSSIMixin");
const SSITypes = require("../SSITypes");

function NodeSSI(identifier) {
    NodeSSIMixin(this);
    const self = this;

    self.deriveChild = () => {
        return self._deriveChild(createNodeSSI)
    }

    self.initialize = function (dlDomain, privateKey, control = '', vn, hint, callback) {
        if (!dlDomain || privateKey || vn || hint || !self.isHintValid()) {
            callback(new Error('Hint provided for valid NodeSSI initialization/load'))
        }

        self.load(SSITypes.NODE_SSI, dlDomain, privateKey, control, vn, hint);
        if(callback) {
            callback(undefined, self);
        }
        self.initialize = function (){
            throw Error("KeySSI already initialized");
        }
    };
}

function createNodeSSI(identifier) {
    return new NodeSSI(identifier);
}

module.exports = {
    createNodeSSI
};