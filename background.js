import { GostCoding } from './lib/src/crypto/gostCoding.js';
import { GostCipher } from './lib/src/engine/gostCipher.js';

const gostCoding = new GostCoding();

const algo = {
    name: 'GOST 28147',
    block: 'CTR',
    keyMeshing: 'CP',
    block: 'CFB',
    iv: '1234567890abcdef',
    sBox: 'E-A'
}

const Hex = gostCoding.Hex;

if (algo.iv) {
    (algo.iv = Hex.decode(algo.iv));
}

//const cipher = GostEngine.getGostCipher(algo);
var cipher = new GostCipher(algo);

const PATH_MATHIEU = './keysMathieu.json';
const PATH_YOHAN = './keysYohan.json';
var CurrentKey = "";

function encodeHex(string) {
    return string.split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

function decodeHex(hex) {
    return hex.split(/(\w\w)/g).filter(p => !!p).map(c => String.fromCharCode(parseInt(c, 16))).join("");
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function useKeyFromFileToEncrypt(path, details, tabId) {
    readTextFile(path, function(text) {
        encryptMessage(text, details, tabId);
    });
}

function useKeyFromFileToDecrypt(path, mail, tabId) {
    readTextFile(path, function(text) {
        decryptMessage(text, mail, tabId);
    });
}

function encryptMessage(data, details, tabId) {
    var keys = JSON.parse(data);
    var mail = details.to[0].trim();
    for (let i = 0; i < keys.length; i++) {
        if (keys[i]["mail"].trim() == mail) {
            CurrentKey = keys[i]["key"];
            break;
        }
    }
    if (details.isPlainText) {
        // The message is being composed in plain text mode.
        let body = details.plainTextBody;

        //changer body en chiffrant
        var inputHex = encodeHex(body);
        var encrypted = Hex.encode(cipher.encrypt(Hex.decode(CurrentKey), Hex.decode(inputHex)));
        encrypted = encrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase();

        body = encrypted;
        //body += "\r\nContenu du document chiffré";
        browser.compose.setComposeDetails(tabId, { plainTextBody: body });
    } else {
        // The message is being composed in HTML mode. Parse the message into an HTML document.
        let document = new DOMParser().parseFromString(details.body, "text/html");

        // Use normal DOM manipulation to modify the message.
        let message = document.getElementsByTagName("body")[0];
        var lignes = message.innerText.split("\n");

        document.body.innerHTML = "";
        for (let i = 0; i < lignes.length; i++) {
            let para = document.createElement("p");
            if (lignes[i] != "") {
                let text = lignes[i]; // + "hash";
                //changer le contenu du paragraphe en chiffrant
                let inputHex = encodeHex(text);
                let encrypted = Hex.encode(cipher.encrypt(Hex.decode(CurrentKey), Hex.decode(inputHex)));
                encrypted = encrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase();
                para.textContent = encrypted;
            }
            document.body.appendChild(para);
        }
        let para = document.createElement("p");
        //para.textContent = "Contenu du document chiffré";
        document.body.appendChild(para);

        let html = new XMLSerializer().serializeToString(document);
        browser.compose.setComposeDetails(tabId, { body: html });
    }
}

function decryptMessage(data, mail, tabId) {
    var keys = JSON.parse(data);
    for (let i = 0; i < keys.length; i++) {
        if (keys[i]["mail"].trim() == mail) {
            CurrentKey = keys[i]["key"];
            break;
        }
    }
    readTextFile('./scripts/inboxMessageScript.js', function(text) {
        browser.tabs.executeScript(tabId, { code: text });
    });
}

browser.composeAction.onClicked.addListener(async(tab) => {
    var tabId = tab.id;
    var details = await browser.compose.getComposeDetails(tabId);
    useKeyFromFileToEncrypt(PATH_MATHIEU, details, tabId);
});

browser.messageDisplayAction.onClicked.addListener(async(tab) => {
    var tabId = tab.id;
    browser.messageDisplay.getDisplayedMessage(tab.id).then((message, author) => {
        var mail = message.author.split("<")[1].replace(">", "").trim();
        useKeyFromFileToDecrypt(PATH_YOHAN, mail, tabId);
    });
});

function decryptMessageContent(request, sender, sendResponse) {
    var lignes = request.message;
    for (let i = 0; i < lignes.length; i++) {
        //changer le contenu du paragraphe en déchiffrant
        if (lignes[i] != "") {
            let text = lignes[i];
            var decrypted = Hex.encode(cipher.decrypt(Hex.decode(CurrentKey), Hex.decode(text)));
            decrypted = decrypted.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase();
            let output = decodeHex(decrypted);
            lignes[i] = output;
        }
    }
    sendResponse({ response: lignes });
}

browser.runtime.onMessage.addListener(decryptMessageContent);