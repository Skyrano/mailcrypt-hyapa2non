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
    var mail = details.to[0];
    var key;
    for (let i = 0; i < keys.length; i++) {
        if (keys[i]["mail"] == mail) {
            key = keys[i]["key"];
            break;
        }
    }
    console.log(key);
    if (details.isPlainText) {
        // The message is being composed in plain text mode.
        let body = details.plainTextBody;
        //changer body en chiffrant
        body += "\r\nContenu du document chiffré";
        console.log("Modified compose");
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
            //changer le contenu du paragraphe en chiffrant
            if (lignes[i] != "") {
                para.textContent = lignes[i] + " hash";
            }
            document.body.appendChild(para);
        }
        let para = document.createElement("p");
        para.textContent = "Contenu du document chiffré";
        document.body.appendChild(para);

        let html = new XMLSerializer().serializeToString(document);
        console.log("Modified compose");
        browser.compose.setComposeDetails(tabId, { body: html });
    }
}

function decryptMessage(data, mail, tabId) {
	var keys = JSON.parse(data);
	console.log(keys);
    var key;
    for (let i = 0; i < keys.length; i++) {
        if (keys[i]["mail"] == mail) {
            key = keys[i]["key"];
            break;
        }
    }
    console.log(key);
	browser.tabs.executeScript(tabId, { file: './scripts/secu.js' });
}

browser.composeAction.onClicked.addListener(async(tab) => {
    var tabId = tab.id;
    var details = await browser.compose.getComposeDetails(tabId);
    useKeyFromFileToEncrypt('./keysMathieu.json', details, tabId);
});


browser.messageDisplayAction.onClicked.addListener(async(tab) => {
	var tabId = tab.id;
    browser.messageDisplay.getDisplayedMessage(tab.id).then((message, author) => {
        var mail = message.author.split("<")[1].replace(">","");
        console.log(mail);
        useKeyFromFileToDecrypt('./keysYohan.json', mail, tabId);
    });
});