//const { gostCrypto, gostEngine } = require('node-gost-crypto');
//const { gostCrypto, gostEngine } = require('node-crypto-gost');
//const { CryptoGost, GostEngine } = require('@vostokplatform/crypto-gost-js');
const { CryptoGost, GostEngine } = require('@wavesenterprise/crypto-gost-js');
//const { CryptoGost, GostEngine } = require('crypto-gost');
const gostCoding = CryptoGost.coding;


const algo = {
    name: 'GOST 28147',
    block: 'CTR',
    keyMeshing: 'CP',
    block: 'CFB',
    iv: '1234567890abcdef',
    sBox: 'E-A'
}

var key = '4ef72b778f0b0bebeef4f077551cb74a927b470ad7d7f2513454569a247e989d';
var input = 'Bonjour j éclate tes grands morts sur la place publique putain de librairie de gost de merde va crever :^ )';
var inputHex = new Buffer(input).toString('hex');

var Hex = gostCoding.Hex;

if (algo.iv) {
    (algo.iv = Hex.decode(algo.iv));
}

var cipher = GostEngine.getGostCipher(algo);

var encrypted = Hex.encode(cipher.encrypt(Hex.decode(key), Hex.decode(inputHex)));
var decrypted = Hex.encode(cipher.decrypt(Hex.decode(key), Hex.decode(encrypted)));

decrypted =  decrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase()
output = new Buffer(decrypted, 'hex').toString();
console.log(output);

console.log("Fin de test");