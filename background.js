chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.cmd == "closeTabs") {
        sendResponse(bg_closeChromeTabs());
        return true;
    }
    return true;
});

function bg_closeChromeTabs() {

    var currentTab = null;
    var closeTabs = function(bCloseCurrentTab) {
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if (currentTab.id === tabs[i].id && bCloseCurrentTab === false) {
                    continue;
                } else {
                    chrome.tabs.remove(tabs[i].id);
                }
            }
        });
    }

    //get the current tab
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        currentTab = tabs[0];
    });

    closeTabs(false); //close all but current
    closeTabs(true); //exit program

    return {
        complete: "exiting chrome..."
    };
}