const ssiFactory = require("../SSIFactory").createSSIFactory();

function SeedSSIFactory() {

}

SeedSSIFactory.prototype.getRelatedType = ssiFactory.getRelatedType;

SeedSSIFactory.prototype.createKeySSI = ssiFactory.createKeySSI;

SeedSSIFactory.prototype.registerFactory = ssiFactory.registerFactory;

module.exports = SeedSSIFactory;