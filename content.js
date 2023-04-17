chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  
    if (request.requestType === "scrapeLeads") {
      console.log('received request from popup script to scrape data');
      
        let leads = document.querySelectorAll('.entity-result');
  
        let scrapedData = [...leads].map(lead => {
          //let leadImage = lead.querySelector('.presence-entity.presence-entity--size-3 img').getAttribute('src');
          let leadName = lead.querySelector('.app-aware-link > span > span').innerText;
          let leadTitle = lead.querySelector('.entity-result__primary-subtitle.t-14.t-black.t-normal').innerText;
          let leadProfileLink = lead.querySelector('.app-aware-link').href;
  
          return { leadName, leadTitle, leadProfileLink };
        });
        console.log(scrapedData);

        // Send the scraped data to the background script and handle any errors
        chrome.runtime.sendMessage({ requestType: "storeData", data: scrapedData, keyName: "campaign 1" }, function(response) {
          console.log("Request sent to background script to store data");

          // receiving a response from the background script as a confirmation that the data has been stored in the local storage
          console.log(response.message);

          // sending response back to popup script confirming that the data has been scraped and stored in the local storage  
          sendResponse({ message: "Data scraped and stored successfully" });        
        });

      return true;
    }

    
  });
  

