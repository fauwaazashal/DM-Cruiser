// Listens for when the extension icon in the toolbar is clicked
chrome.action.onClicked.addListener(function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        var currentUrl = currentTab.url;

        // if the URL includes LinkedIn then no need for a redirect
        if (currentUrl.includes("linkedin.com")) {
        chrome.action.setPopup({ tabId: currentTab.id, popup: "home.html" });
        console.log("No need for page redirect as we are already on LinkedIn");
        } 

        // if the current URL is not LinkedIn, then create a new tab and enter the LinkedIn URL
        else {
        chrome.tabs.create({ url: "https://www.linkedin.com/search/results/people" }, function(tab) {
        chrome.action.setPopup({ tabId: tab.id, popup: "home.html" });
        console.log("Page redirected to LinkedIn");
        });
        }
    });
});



//--------------------------------------storing data in local storage-------------------------------------------



// Listens for message requests from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  // request from content script to store scraped data
  if (request.requestType === "Store data") {
    console.log("Received request from content script to store scraped data");

    // finding out the position of the new Campaign whose data is about to be stored (For Example : Campaign 3)
    //let keyLength;
    chrome.storage.local.get(null, function(items) {
      let keyLength = Object.keys(items).length;
      console.log(items);
    
    
      let campaignName = request.keyName;
      const myData = request.data;
      // storing data in local storage
      chrome.storage.local.set({ [campaignName]: myData }, function() {
        console.log("Data stored in local storage");

        // sending response to content script confirming that the data has been stored successfully
        sendResponse({ message: `${campaignName} Data stored successfully` });
      });
    });

    // return true to keep the message port open until the response is received
    return true;
  }

});

