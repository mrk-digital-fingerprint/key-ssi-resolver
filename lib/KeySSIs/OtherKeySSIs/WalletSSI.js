const SeedSSI = require("./../SeedSSIs/SeedSSI");
const ArraySSI = require("./../ConstSSIs/ArraySSI");
const SSITypes = require("../SSITypes");

function WalletSSI(identifier) {
    const self = this;
    const arraySSI = ArraySSI.createArraySSI(identifier);

    arraySSI.getTypeName = () => {
        return SSITypes.WALLET_SSI;
    };

    Object.assign(self, arraySSI);

    self.bindWithSeedSSI = (seedSSI, callback) => {
        let resolver = require("opendsu").loadApi("resolver");
        resolver.createDSU(self.getIdentifier(), {useSSIAsIdentifier: true}, (err, constDSU) => {
            if (err) {
                return callback(err);
            }
            constDSU.writeFile("/wallet", seedSSI, (err, data) => {
                if (err) {
                    return callback(err);
                }
                callback(undefined, self);
            });
        });
    }

    self.getBoundSeedSSI = (callback) => {
        let resolver = require("opendsu").loadApi("resolver");
        resolver.loadDSU(self.getIdentifier(), (err, constDSU) => {
            if (err) {
                return callback(err);
            }
            constDSU.readFile("/wallet", (err, data) => {
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
