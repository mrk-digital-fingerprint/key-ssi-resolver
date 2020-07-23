const KeySSIMixin = require("../KeySSIMixin");
const SReadSSI = require("./SReadSSI");
const SSITypes = require("../SSITypes");

function SeedSSI(identifier) {
    Object.assign(this, KeySSIMixin);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    let pubKey;

    this.initialize = (dlDomain, privateKey, publicKey, vn, hint, callback) => {
        this.subtype = SSITypes.SEED_SSI;
        this.dlDomain = dlDomain;
        this.vn = vn || 'v0';
        this.control = '';
        this.hint = hint;
        if (typeof privateKey === "undefined") {
            this.cryptoRegistry.getKeyPairGeneratorFunction(this.vn)((err, publicKey, privateKey) => {
                if (err) {
                    return callback(err);
                }
                pubKey = publicKey;
                this.subtypeSpecificString = privateKey;
                callback(undefined, this);
            });
        }
    };

    this.derive = () => {
        const sReadSSI = SReadSSI.createSReadSSI();
        const subtypeKey = this.cryptoRegistry.getHashFunction(this.vn)(this.subtypeSpecificString);

        if (typeof pubKey === "undefined") {
            throw Error("The public key is undefined. The initialize method was not called");
        }

        const subtypeControl = this.cryptoRegistry.getHashFunction(this.vn)(pubKey);
        sReadSSI.load(SSITypes.SREAD_SSI, this.dlDomain, subtypeKey, subtypeControl, this.vn, this.hint);
        return sReadSSI;
    };

    this.getEncryptionKey = () => {
        return this.derive().getEncryptionKey();
    };
}

function createSeedSSI(identifier) {
    return new SeedSSI(identifier);
}

module.exports = {
    createSeedSSI
};