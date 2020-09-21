const SeedSSI = require("./../SeedSSIs/SeedSSI");
const SSITypes = require("../SSITypes");

function WalletSSI(identifier) {
    const seedSSI = SeedSSI.createSeedSSI(identifier);
    Object.assign(this, seedSSI);

    this.initialize = (dlDomain, privateKey, publicKey, vn, hint, callback) => {
        seedSSI.load(SSITypes.WALLET_SSI, dlDomain, privateKey, publicKey, vn, hint, callback);
    }

    this.store = (options) => {
        let ssiCage = require("../../ssiCage");
        if(typeof options !== "undefined" && options.ssiCage !== "undefined"){
            ssiCage = options.ssiCage;
        }
        ssiCage.putSSI(this.getIdentifier(), options.password, options.overwrite, (err) => {
            if (err) {
                return callback(err);
            }
            callback(undefined, this);
        });
    }

    //options.ssiCage - custom implementation of a SSI Cage
    this.getSeedSSI = (secret, options, callback) => {
        if(typeof options === "function"){
            callback = options;
            options = {};
        }

        let ssiCage = require("../../ssiCage");
        if(typeof options.ssiCage === "undefined"){
            ssiCage = options.ssiCage;
        }
        ssiCage.getSSI(secret, (err, ssiSerialization)=>{
            if(err){
                return callback(err);
            }

            //SeedSSI or WalletSSI ???????????
            let keySSI = new SeedSSI(ssiSerialization);
            keySSI.options = options;
            callback(undefined, keySSI);
        });
    }

    this.checkForSSICage = (callback) => {
        let ssiCage = require("../../ssiCage");
        ssiCage.check(callback);
    }
}

function createWalletSSI(identifier) {
    return new WalletSSI(identifier);
}

module.exports = {
    createWalletSSI
}