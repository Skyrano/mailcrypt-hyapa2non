/*
"options_ui": {
        "page": "options/options.html",
        "open_in_tab": false,
        "browser_style": true
    },
*/

function result() {
    var numberValue = document.getElementById("txtInput").value;
    if (!isNaN(numberValue))
        console.log("The value=" + parseInt(numberValue));
    else
        console.log("Please enter the integer value..");
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