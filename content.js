chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  
    if (request.requestType === "scrapeLeads") {
      console.log('received request from popup script to scrape data');
      
        let scrapedData = [];

        let leads = document.querySelectorAll('.entity-result');

        for (let i = 0; i < leads.length; i++) {

            if (leads[i].querySelector('.artdeco-button__text').innerText == 'Connect') {

                let leadName = leads[i].querySelector('.app-aware-link > span > span').innerText;
                let leadFirstName = leadName.split(' ')[0];
                let leadLastName = leadName.split(' ', 2)[1];
                let leadTitle = leads[i].querySelector('.entity-result__primary-subtitle.t-14.t-black.t-normal').innerText;
                let leadProfileLink = leads[i].querySelector('.app-aware-link').href;
                let leadImageElement = leads[i].querySelector('.presence-entity.presence-entity--size-3 img');
                let leadImage = leadImageElement ? leadImageElement.getAttribute('src') : ''; 

                let leadData = {
                  fullName: leadName,
                  firstName: leadFirstName,
                  lastName: leadLastName,
                  title: leadTitle,
                  profileLink: leadProfileLink,
                  image: leadImage
                };

                scrapedData.push(leadData);

            }
        }
        


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
  

