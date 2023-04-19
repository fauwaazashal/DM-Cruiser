chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  continueScraping = true;

  // executes the following block when user sends a request to begin scraping
  if (request.requestType === "scrapeLeads") {
    console.log("recieved request from popup script to initiate scraping");

    let scrapedData = [];
    while (continueScraping) {

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

      console.log("scraped one page, now scrolling to the bottom of the screen");

      
      let nextPage = document.querySelector('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view');
      if (nextPage.disabled) {
        //console.log("cannot click to go to next page");
        continueScraping = false;
        sendResponse({ message: "No more data to scrape" });
      }
      else {
        setTimeout(nextPage.click(), 2000);
      }

      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.requestType === "pauseScraping") {
          console.log("recieved request from popup script to pause scraping");
          continueScraping = false;
          sendResponse({ message: "scraping paused" });
          return true;
        }
        if (request.requestType === "stopScraping") {
          console.log("recieved request from popup script to stop scraping");
          continueScraping = false;
          sendResponse({ message: "scraping completed" });
          return true;
        }
      });
    }
  }

  //executes the following block if user resumes scraping after having paused it earlier
  if (request.requestType === "resumeScraping") {
    console.log("recieved request from popup script to resume scraping");

    while (continueScraping) {

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

      window.scrollTo(0, document.body.scrollHeight);
      let nextPage = document.querySelector('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view');
      if (nextPage.disabled) {
        //console.log("cannot click to go to next page");
        continueScraping = false;
        sendResponse({ message: "No more data to scrape" });
      }
      else {
        setTimeout(nextPage.click(), 2000);
      }

      chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.requestType === "pauseScraping") {
          console.log("recieved request from popup script to pause scraping");
          continueScraping = false;
          sendResponse({ message: "scraping paused" });
          return true;
        }
        if (request.requestType === "stopScraping") {
          console.log("recieved request from popup script to stop scraping");
          continueScraping = false;
          sendResponse({ message: "scraping completed" });
          return true;
        }
      });
    }
  }
  
});
/*
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
*/

