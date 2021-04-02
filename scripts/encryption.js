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

var key = '436563694e65506575745175457472654c75506172556e466169626c653a5e29';
var input = 'Bonjour j éclate tes grands morts sur la place publique putain de librairie de gost de merde va crever :^ )';
var inputHex = input.split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");

var Hex = gostCoding.Hex;

if (algo.iv) {
    (algo.iv = Hex.decode(algo.iv));
}

var cipher = GostEngine.getGostCipher(algo);

var encrypted = Hex.encode(cipher.encrypt(Hex.decode(key), Hex.decode(inputHex)));
var decrypted = Hex.encode(cipher.decrypt(Hex.decode(key), Hex.decode('4e48742091460bffdca0583be081cd60d7ae36c11d79a4')));

decrypted = decrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase()
output = decrypted.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("")
console.log(output);

console.log("Fin de test");