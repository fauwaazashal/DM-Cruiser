chrome.action.onClicked.addListener(function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        var currentUrl = currentTab.url;

        if (currentUrl.includes("linkedin.com")) {
        chrome.action.setPopup({ tabId: currentTab.id, popup: "popup.html" });
        } 
        else {
        chrome.tabs.create({ url: "https://www.linkedin.com/search/results/people" }, function(tab) {
        chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" });
        });
        }
    });
});