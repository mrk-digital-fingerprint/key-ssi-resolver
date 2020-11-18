const SeedSSI = require("./../SeedSSIs/SeedSSI");
const SSITypes = require("../SSITypes");

function WalletSSI(identifier) {
    const self = this;
    const seedSSI = SeedSSI.createSeedSSI(identifier);

    seedSSI.getName = () => {
        return SSITypes.WALLET_SSI;
    };

    Object.assign(self, seedSSI);

    self.initialize = (dlDomain, privateKey, publicKey, vn, hint, callback) => {

        let oldLoad = seedSSI.load;
        seedSSI.load = function (subtype, dlDomain, subtypeSpecificString, control, vn, hint) {
            oldLoad(SSITypes.WALLET_SSI, dlDomain, subtypeSpecificString, control, vn, hint);
        }

        seedSSI.initialize(dlDomain, privateKey, publicKey, vn, hint, callback);
    }

    self.store = (key, callback) => {
        let keySSISpace = require("opendsu").loadApi("keyssi");
        let resolver = require("opendsu").loadApi("resolver");
        let arraySSI = keySSISpace.buildArraySSI(self.getDLDomain(), key);
        resolver.createDSU(arraySSI, {useSSIAsIdentifier: true}, (err, constDSU) => {
            if (err) {
                return callback(err);
            }
            constDSU.writeFile("/wallet.ssi", self.getIdentifier(), (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(undefined, self);
            });
        });
    }

    self.getSeedSSI = (key, callback) => {
        let keySSISpace = require("opendsu").loadApi("keyssi");
        let resolver = require("opendsu").loadApi("resolver");
        let arraySSI = keySSISpace.buildArraySSI(self.getDLDomain(), key);
        resolver.loadDSU(arraySSI, (err, constDSU) => {
            if (err) {
                return callback(err);
            }
            constDSU.readFile("/wallet.ssi", (err, data) => {
                if (err) {
                    return callback(err);
                }
                const ssiSerialization = data.toString();
                let keySSI = SeedSSI.createSeedSSI(ssiSerialization);
                callback(undefined, keySSI);
            });
        });
    }
}

function createWalletSSI(identifier) {
    return new WalletSSI(identifier);
}

module.exports = {
    createWalletSSI
}
