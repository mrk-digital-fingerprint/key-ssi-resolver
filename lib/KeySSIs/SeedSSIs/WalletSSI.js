const KeySSIMixin = require("../KeySSIMixin");
const SeedSSI = require("./SeedSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../CryptoAlgorithmsRegistry");

function WalletSSI(identifier) {
    const seedSSI = SeedSSI.createSeedSSI(identifier);
    Object.assign(this, seedSSI);
    this.initialize = (dlDomain, privateKey, publicKey, vn, hint, callback) => {
        this.subtype = SSITypes.WALLET_SSI;
        seedSSI.initialize(dlDomain, privateKey, publicKey, vn, hint, callback);
    }
}

function createWalletSSI(identifier) {
    return new WalletSSI(identifier);
}

module.exports = {
    createWalletSSI
}