//Alistair Rameau et Yoann Kergosien

//fonction callback qui sera appelée au retour du background avec la réponse du déchiffrement
//avec cette réponse on remplace toutes les lignes du document par leur version déchiffrée
function changeText(message) {
    var lignes = message.response;
    document.body.innerHTML = ""; //on vide le document
    for (let i = 0; i < lignes.length; i++) {
        let para = document.createElement("p");
        para.textContent = lignes[i];
        document.body.appendChild(para); //on ajoute chaque ligne en tant que paragraphe au document
    }
}

//cette fonction envoie le contenu du mail séparé en lignes au backend pour qu'il soit déchiffré
//et indique la fonction callback qui traitera la réponse
function requestDecoding(string) {
    var sending = browser.runtime.sendMessage({ message: string });
    sending.then(changeText);
}

//on récupère toute la page et on la divise en lignes
let message = document.getElementsByTagName("body")[0];
var lignes = message.innerText.split("\n");

//on requête le backend pour déchiffrer
requestDecoding(lignes);