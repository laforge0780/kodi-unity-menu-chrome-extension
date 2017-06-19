function getDefaultPrefs() {
    return {
        "bUseWhitelist": false,
        "aWhitelist": ["www.stan.com.au"],
        "sMenuColour": "E51C23"
    };
}

function resetDefaultPrefs() {
    chrome.storage.sync.clear(function() {
        if (chrome.runtime.lastError) {
            console.log("clear settings error.");
        } else {
            loadSavedSettings();
        }
    })
}

function setFormValues(settings) {
    document.getElementById("useWhiteList").checked = settings.bUseWhitelist;
    document.getElementById("whiteList").value = settings.aWhitelist.join(",");
    document.getElementById("menuColour").value = settings.sMenuColour;

    setWhiteListVisibility();
}

function getFormValues() {
    var settings = {};

    settings.bUseWhitelist = document.getElementById("useWhiteList").checked;
    settings.aWhitelist = document.getElementById("whiteList").value.split(",");
    settings.sMenuColour = document.getElementById("menuColour").value;

    return settings;
}

function setWhiteListVisibility() {
    if (document.getElementById("useWhiteList").checked) {
        document.getElementById("whiteList-form-group").style.display = "block";
    } else {
        document.getElementById("whiteList-form-group").style.display = "none";
    }
}

/***
 * validate user input
 * currently only checking the colour string
 * @returns {object} {bValid: {boolean},sErrorText:{string} when !bValid}
 ***/
function validatePrefs() {
    var oUserInput = getFormValues();

    //test for # in colour string
    if (oUserInput.sMenuColour.indexOf("#") !== -1) {
        return {
            bValid: false,
            sErrorText: "Invalid colour. Don't prefix the color with a hash(#) symbol."
        };
    }

    //test for valid hex input
    var valueNoZeros = ((/^[0\0]+$/.test(oUserInput.sMenuColour)) ? "0" : oUserInput.sMenuColour.replace(/^[0|/D]*/, ""));
    var a = parseInt(oUserInput.sMenuColour, 16);

    if (!(a.toString(16) === valueNoZeros.toLowerCase())) {
        return {
            bValid: false,
            sErrorText: "Invalid Colour. Hexadecimal input only.(0 - 9, A - F)"
        };
    }

    //TODO test for whitelist content

    return {
        bValid: true,
        sErrorText: ""
    };
}

function savePrefs() {
    var oValidate = validatePrefs();

    if (!oValidate.bValid) {
        alert(oValidate.sErrorText);
        return;
    }

    chrome.storage.sync.set(getFormValues(), function() {
        alert("Settings updated.");
    });
}

function loadSavedSettings() {
    //load saved pref/or defaults
    chrome.storage.sync.get(
        getDefaultPrefs(), function(data) {
        if (!chrome.runtime.lastError) {
            setFormValues(data);
        } else {
            console.log("load settings error.");
        };
    })
}

window.onload = function() {
    loadSavedSettings();

    //events
    document.getElementById("restoreDefaults").onclick = function() {
        resetDefaultPrefs();
    };
    document.getElementById("savePrefs").onclick = function() {
        savePrefs();
    };

    document.getElementById("useWhiteList").onchange = function() {
        setWhiteListVisibility();
    };
};