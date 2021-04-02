let message = document.getElementsByTagName("body")[0];
var lignes = message.innerText.split("\n");

var key = "INSERT_KEY";

console.log(browser.runtime.getURL('.'));

function decodeHex(hex) {
    return hex.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("");
}

document.body.innerHTML = "";
var i;
for (i = 0; i < lignes.length; i++) {
    let para = document.createElement("p");
    //changer le contenu du paragraphe en chiffrant
    if (lignes[i] != "") {
        let text = lignes[i];
        var decrypted = Hex.encode(cipher.decrypt(Hex.decode(key), Hex.decode(text)));
        decrypted = decrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase();
        let output = decrypted.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("")
        output = decodeHex(output);
        para.textContent = output;
    }
    document.body.appendChild(para);
}
let para = document.createElement("p");
para.textContent = "Contenu du document déchiffré";
document.body.appendChild(para);