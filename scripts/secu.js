let message = document.getElementsByTagName("body")[0];
var lignes = message.innerText.split("\n");

document.body.innerHTML = "";
var i;
for (i = 0; i < lignes.length; i++) {
    let para = document.createElement("p");
    //changer le contenu du paragraphe en chiffrant
    if (lignes[i] != "") {
        para.textContent = lignes[i] + " dehash";
    }
    document.body.appendChild(para);
}
let para = document.createElement("p");
para.textContent = "Contenu du document déchiffré";
document.body.appendChild(para);
console.log("Modified message");