let message = document.getElementsByTagName("body")[0];
var lignes = message.innerText.split("\n");

function changeText(message) {
    var lignes = message.response;
    document.body.innerHTML = "";
    for (let i = 0; i < lignes.length; i++) {
        let para = document.createElement("p");
        para.textContent = lignes[i];
        document.body.appendChild(para);
    }
}

function requestDecoding(string) {
    var sending = browser.runtime.sendMessage({ message: string });
    sending.then(changeText);
}

requestDecoding(lignes);