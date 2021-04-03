//Alistair Rameau et Yoann Kergosien

//Ici nous importons le chiffreur permettant de chiffrer en Gost et l'encodeur pour convertir un string en objet hexadecimal
import { GostCoding } from './lib/src/crypto/gostCoding.js';
import { GostCipher } from './lib/src/engine/gostCipher.js';

const gostCoding = new GostCoding(); //Nous créons l'encodeur

//Nous spécifions le type de l'algo voulu
const algo = {
    name: 'GOST 28147',
    block: 'CTR',
    keyMeshing: 'CP',
    block: 'CFB',
    iv: '1234567890abcdef',
    sBox: 'E-A'
}

//Nous récupérons l'encodeur Hexadécimal
const Hex = gostCoding.Hex;

//Nous convertissons le vecteur initial en objet hexadécimal
if (algo.iv) {
    (algo.iv = Hex.decode(algo.iv));
}

//Nous créons un chiffreur
var cipher = new GostCipher(algo);

const PATH_MATHIEU = './keys/keysMathieu.json';
const PATH_YOHAN = './keys/keysYohan.json';
var CurrentKey = "";

//Cette fonction permet de changer chaque caractère d'une chaine en son équivalent hexadécimal
function encodeHex(string) {
    return string.split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

//Cette fonction permet de reverse la fonction précédente, donc a partir d'une chaine de charactere encodé en hexadécimal récupére le string initial
function decodeHex(hex) {
    return hex.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("");
}

//Cette fonction lit un fichier en tant que texte en utilisant une requête HttpRequest en GET, avant de renvoyer le résultat au callback voulu
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() { //quand la requête a une réponse
        if (rawFile.readyState === 4 && rawFile.status == "200") { //si la réponse est bonne (code 200)
            callback(rawFile.responseText); //on envoie le texte au callback
        }
    }
    rawFile.send(null);
}

//Cette fonction lit un fichier donné et utilise son contenu pour chiffrer
function useKeyFromFileToEncrypt(path, details, tabId) {
    readTextFile(path, function(text) {
        encryptMessage(text, details, tabId);
    });
}

//Cette fonction lit un fichier donné et utilise son contenu pour déchiffrer
function useKeyFromFileToDecrypt(path, mail, tabId) {
    readTextFile(path, function(text) {
        decryptMessage(text, mail, tabId);
    });
}

function encryptMessage(data, details, tabId) {
    var keys = JSON.parse(data); //on parse le contenu du fichier lu en tant que fichier json
    var mail = details.to[0].trim(); // on recupere l'address mail utilisée pour voir sa clé est dans le json
    for (let i = 0; i < keys.length; i++) {
        if (keys[i]["mail"].trim() == mail) { //si on trouve le mail dans le json
            CurrentKey = keys[i]["key"]; //la clé utilisée sera celle de cet email
            break;
        }
    }
    if (details.isPlainText) { //le message est au format text brut
        let body = details.plainTextBody;

        //on change le body en chiffrant tout son contenu en une fois
        var inputHex = encodeHex(body); //Nous mettons notre texte au format hexadécimal
        var encrypted = Hex.encode(cipher.encrypt(Hex.decode(CurrentKey), Hex.decode(inputHex))); //Nous chiffrons notre texte
        encrypted = encrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase(); //Ici nous trimons afin de nous assurer qu'il n'y a aucun élément problématique qui s'est glissé dans notre chaine de charactère
        body = encrypted;

        CurrentKey = ""; //on efface la clé utilisée
        browser.compose.setComposeDetails(tabId, { plainTextBody: body });
    } else { //le message est au format HTML (par défaut)

        let document = new DOMParser().parseFromString(details.body, "text/html"); //on récupére le body du message
        let message = document.getElementsByTagName("body")[0];

        var lignes = message.innerText.split("\n"); //on divise ce body en lignes

        document.body.innerHTML = ""; //on efface le contenu actuel qui va être remplacé
        for (let i = 0; i < lignes.length; i++) {
            let para = document.createElement("p");
            if (lignes[i] != "") {
                let text = lignes[i];
                //changer le contenu du paragraphe en chiffrant ligne par ligne
                let inputHex = encodeHex(text); //Nous mettons notre texte au format hexadécimal
                let encrypted = Hex.encode(cipher.encrypt(Hex.decode(CurrentKey), Hex.decode(inputHex))); //Nous chiffrons notre ligne
                encrypted = encrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase(); //Ici nous faisons un trim afin de nous assurer qu'il n'y a aucun élément problématique qui s'est glissé dans notre chaine de charactère
                para.textContent = encrypted;
            }
            document.body.appendChild(para); //on ajoute la ligne en tant que paragraphe au document
        }

        CurrentKey = ""; //on efface la clé utilisée
        let html = new XMLSerializer().serializeToString(document);
        browser.compose.setComposeDetails(tabId, { body: html }); //le message actuellement écrit devient le message chiffré
    }
}

function decryptMessage(data, mail, tabId) {
    var keys = JSON.parse(data); //on parse le contenu du fichier lu en tant que fichier json
    for (let i = 0; i < keys.length; i++) {
        if (keys[i]["mail"].trim() == mail) { //si on trouve le mail dans le json
            CurrentKey = keys[i]["key"]; //la clé utilisée sera celle de cet email
            break;
        }
    }
    //on va récupérer le script prévu en tant que texte pour le lancer en tant que content-script dans la page d'affichage du message à déchiffrer
    readTextFile('./scripts/inboxMessageScript.js', function(text) {
        browser.tabs.executeScript(tabId, { code: text });
    });
}

//Action effectuée si jamais l'utilisateur appuie sur le bouton de l'addon lors de la création d'un mail
browser.composeAction.onClicked.addListener(async(tab) => {
    var tabId = tab.id; //on récupère l'id de l'onglet actif
    var details = await browser.compose.getComposeDetails(tabId); //on récupère les détails du message, avec entres autres le mail destinataire et le contenu
    useKeyFromFileToEncrypt(PATH_MATHIEU, details, tabId); //on lance le chiffrement
});

//Action effectuée si jamais l'utilisateur appuie sur le bouton de l'addon lors de l'affichage d'un mail
browser.messageDisplayAction.onClicked.addListener(async(tab) => {
    var tabId = tab.id; //on récupère l'id de l'onglet actif
    browser.messageDisplay.getDisplayedMessage(tab.id).then((message, author) => { //on récupère le message actuellement affiché
        var mail = message.author.split("<")[1].replace(">", "").trim();
        useKeyFromFileToDecrypt(PATH_YOHAN, mail, tabId); //on lance le déchiffrement
    });
});

//fonction déchiffrant le message envoyé sous forme de lignes et renvoyant la réponse au front-end
function decryptMessageContent(request, sender, sendResponse) {
    var lignes = request.message;
    for (let i = 0; i < lignes.length; i++) {
        //changer le contenu du paragraphe en déchiffrant
        if (lignes[i] != "") {
            let text = lignes[i];
            var decrypted = Hex.encode(cipher.decrypt(Hex.decode(CurrentKey), Hex.decode(text))); //Nous déchiffrons le message
            decrypted = decrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase(); //Ici nous faisons un trim afin de nous assurer qu'il n'y a aucun élément problématique qui s'est glissé dans notre chaine de charactère
            let output = decodeHex(decrypted); //Enfin nous décodons notre chaine de charactère de l'hexadécimal
            lignes[i] = output; //cette ligne devient la version déchiffrée
        }
    }
    CurrentKey = ""; //on efface la clé utilisée
    sendResponse({ response: lignes }); //on renvoie la réponse à la fonction callback fournie par le front-end
}

//On écoute les messages venant du front-end, en envoyant le messsage arrivant à la fonction decryptMessageContent pour être déchiffré et renvoyé
browser.runtime.onMessage.addListener(decryptMessageContent);