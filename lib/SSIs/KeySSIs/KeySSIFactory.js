const ssiFactory = require("../SSIFactory").createSSIFactory();

function KeySSIFactory() {

}

KeySSIFactory.prototype.getRelatedType = ssiFactory.getRelatedType;

KeySSIFactory.prototype.createKeySSI = ssiFactory.createKeySSI;

KeySSIFactory.prototype.registerFactory = ssiFactory.registerFactory;

module.exports = KeySSIFactory;