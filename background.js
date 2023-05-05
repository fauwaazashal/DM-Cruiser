// Listens for when the extension icon in the toolbar is clicked
chrome.action.onClicked.addListener(function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let currentTab = tabs[0];
    let currentUrl = currentTab.url;

    chrome.storage.local.get("lastVisitedPopup", function (data) {
      let popupUrl = data.lastVisitedPopup ? data.lastVisitedPopup.url : "home.html";

      // if the URL includes LinkedIn then no need for a redirect
      if (currentUrl.includes("linkedin.com")) {
        chrome.action.setPopup({ tabId: currentTab.id, popup: popupUrl });
        console.log("No need for page redirect as we are already on LinkedIn");
      }

      // if the current URL is not LinkedIn, then create a new tab and enter the LinkedIn URL
      else {
        chrome.tabs.create({ url: "https://www.linkedin.com/search/results/people" }, function (tab) {
          chrome.action.setPopup({ tabId: tab.id, popup: popupUrl });
          console.log("Page redirected to LinkedIn");
        });
      }
    });


  });
});



chrome.runtime.onConnect.addListener(function(port) {
  console.log("background port detected");
  if (port.name === "load leads profiles") {
    console.log("established connection with port to load users' profiles one by one");

    port.onMessage.addListener(function(request) {
      if (request.action === "Start Sending Invites") {
        console.log("receieved request from popup to load users' profiles");
        let campaignName = request.campaignName;
        let campaignData = request.campaignData;
        let messageTemplate = request.messageTemplate;
        console.log(campaignData[0].profileLink);

        // Update the URL of the tab
        chrome.tabs.update({ url: campaignData[0].profileLink }, function(tab) {
          // Wait until the new URL has been fully loaded before sending the message
          chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              port.postMessage({ message: "page fully loaded" });
              console.log("profile page loaded");

              chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                const invitePort = chrome.tabs.connect(tabs[0].id, { name: "send invites" });
                    console.log("sent request from background script to content script to send invite to a lead")
                    invitePort.postMessage({ 
                      action: request.action, 
                      campaignName: campaignName, 
                      campaignData: campaignData,
                      messageTemplate: messageTemplate
                    });
              });
            }
          });
        });
      }

      else if (request.action === "Stop Sending Invites") {
        console.log('receieved request from popup to stop sending invites');
        isStopped = true;
        port.postMessage({ message: "", data: scrapedData });
      }
    });
  }
});




// // Saves the last visited popup's data when the popup is closed
// chrome.windows.onRemoved.addListener(function(windowId) {
//   // Check if the closed window was the popup window
//   chrome.windows.getLastFocused({populate: true}, function (window) {
//     let popupUrl = chrome.action.getPopup({}).url;
//     if (windowId === window.id && popupUrl) {
//       let currentUrl = window.tabs[0].url;
//       chrome.storage.local.set({ lastVisitedPopup: { url: popupUrl, data: { url: currentUrl } } });
//     }
//   });
// });



// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.requestType === "Check URL") {
//     console.log("received request from popup script to check if we are on the right linkedin url before scraping");
    
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       let currentTab = tabs[0];
//       let currentUrl = currentTab.url;
//       let targetURL = currentUrl + "&%5B%22O%22%2C%22S%22%5D";
  
//       // if the URL includes the encoding for the 2nd & 3rd degree connections then no need for a reload
//       if (currentUrl.includes("%5B%22O%22%2C%22S%22%5D")) {
//         sendResponse({ message: "No need for page reload" });
//         console.log("No need for page reload");
//       }

//       // if the current URL doesn't include the encoding for the 2nd & 3rd degree connections then reload with updated URL
//       else {
//         chrome.tabs.update(tabs[0].id, { url: targetURL}); 
//         sendResponse({ message: "Page reloaded to targetURL" });
//         console.log("Page reloaded to targetURL");
//       }
//     });
//   }
// });



//--------------------------------------storing data in local storage-------------------------------------------



// Listens for message requests from content script
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

//   // request from content script to store scraped data
//   if (request.requestType === "Store data") {
//     console.log("Received request from content script to store scraped data");

//     // finding out the position of the new Campaign whose data is about to be stored (For Example : Campaign 3)
//     //let keyLength;
//     chrome.storage.local.get(null, function (items) {
//       let keyLength = Object.keys(items).length;
//       console.log(items);


//       let campaignName = request.keyName;
//       const myData = request.data;
//       // storing data in local storage
//       chrome.storage.local.set({ [campaignName]: myData }, function () {
//         console.log("Data stored in local storage");

//         // sending response to content script confirming that the data has been stored successfully
//         sendResponse({ message: `${campaignName} Data stored successfully` });
//       });
//     });

//     // return true to keep the message port open until the response is received
//     return true;
//   }

// });


// // listens for requests from popup
// chrome.runtime.onConnect.addListener(function(portPB) {
//   if (portPB.name === "popup-to-background") {
//     console.log("established connection with port");
//     portPB.onMessage.addListener(async function(request) {
//       if (request.action === "Start Scraping") {
//         port.postMessage({ action: "Start Scraping" });
//       }

//       else if (request.action === "Pause Scraping") {
//         port.postMessage({ action: "Pause Scraping" });
//       }

//       else if (request.action === "Stop Scraping") {
//         port.postMessage({ action: "Stop Scraping" });
//       }

//       else if (request.action === "Resume Scraping") {
//         port.postMessage({ action: "Resume Scraping" });
//       }
//     });
//   }
// });