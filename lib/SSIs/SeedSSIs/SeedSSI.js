const crypto = require("pskcrypto");
const KeySSI = require("../KeySSIs/KeySSI");
const SReadSSI = require("./SReadSSI");
const SSITypes = require("../SSITypes");

function SeedSSI(identifier) {
    Object.assign(this, KeySSI);

    if (typeof identifier !== "undefined") {
        this.autoLoad(identifier);
    }

    let pubKey;
    this.initialize = (dlDomain, privateKey, publicKey, vn, hint) => {
        this.subtype = SSITypes.SEED_SSI;
        this.dlDomain = dlDomain;
        if (typeof privateKey === "undefined") {
            const keys = crypto.generateKeyPair();
            privateKey = keys.privateKey;
            publicKey = keys.publicKey;
        }
        pubKey = publicKey;
        this.subtypeSpecificString = privateKey;
        this.control = '';
        this.vn = vn || 'v0';
        this.hint = hint;
    };

    this.derive = () => {
        const sReadSSI = new SReadSSI();
        const subtypeKey = crypto.pskHash(crypto.pskBase58Encode(this.subtypeSpecificString));

        if (typeof pubKey === "undefined") {
            throw Error("The public key is undefined. The initialize method was not called");
        }

        const subtypeControl = crypto.pskHash(pubKey);
        sReadSSI.load(SSITypes.SREAD_SSI, this.dlDomain, subtypeKey, subtypeControl, this.vn, this.hint);
        return sReadSSI;
    };
}

module.exports = SeedSSI;