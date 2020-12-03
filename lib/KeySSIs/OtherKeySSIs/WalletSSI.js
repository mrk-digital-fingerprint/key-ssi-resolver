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

}

function createWalletSSI(identifier) {
    return new WalletSSI(identifier);
}

module.exports = {
    createWalletSSI
}
