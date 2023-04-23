chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "popup-to-content") {
    port.onMessage.addListener( async function(request) {
      if (request.action === "Start Scraping") {
        scrapedData = await scraping();
        port.postMessage({ message: "Scraped one page", data: scrapedData });
      }
      else if (request.action === "Pause Scraping") {}
      else if (request.action === "Stop Scraping") {}
      else if (request.action === "Resume Scraping") {}
    });
  }
});

// // Send the scraped data to the background script and handle any errors
// chrome.runtime.sendMessage({ requestType: "storeData", data: scrapedData, keyName: "campaign 1" }, function(response) {
//   console.log("Request sent to background script to store data");

//   // receiving a response from the background script as a confirmation that the data has been stored in the local storage
//   console.log(response.message);

//   // sending response back to popup script confirming that the data has been scraped and stored in the local storage  
//   sendResponse({ message: "Data scraped and stored successfully" });        
// });

// let isPaused = false;
// let isStopped = false;
// let scrapedData =[];

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.requestType === "scrapeLeads") {
//     console.log('receieved request from popup to begin scraping');
//     //let scrapedData =[];
//     scrapedData = scraping(scrapedData); // call function to scrape data
//     console.log(scrapedData);
//     sendResponse({ message: "scraped one page", data: scrapedData });
//   }
//   else if (request.requestType === "pauseScraping") {
//     console.log('receieved request from popup to pause scraping');
//     isPaused = true; // 
//   }
//   else if (request.requestType === "stopScraping") {
//     console.log('receieved request from popup to stop scraping');
//     isStopped = true;
//     sendResponse({ message: "scraping completed" });
//   }
//   else if (request.requestType === "resumeScraping") {
//     console.log('receieved request from popup to resume scraping');
//     isPaused = false;
//     scraping(scrapedData);
//   }
//   return true;
// });



// function to scraped leads from the current page 
const scraping = async (scrapedData) => {

  //while (!isPaused && !isStopped) {
    let scrapedData =[];
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
    //}
    
    console.log(scrapedData);

    // if (isPaused) {
    //   console.log("Action has been paused.");
    //   return;
    // }
    // if (isStopped) {
    //   console.log("Action has been stopped.");
    //   return;
    // }
    
    await goToNextPage();
    //await new Promise(resolve => setTimeout(resolve, 3000));
    
    return scrapedData;
    // if (!isPaused) {
    //   scraping(scrapedData);
    // }
  }
  
  

};


// function to scroll to to the bottom of the page and click on Next Page
const goToNextPage = () => {
  return new Promise(resolve => {
    const pageHeight = document.body.scrollHeight;
    const animationDuration = 2000; // in milliseconds
    const framesPerSecond = 60;

    let currentScrollPosition = window.scrollY; // get the current scroll position

    function scrollPage() {
      currentScrollPosition += distancePerFrame;

      if (currentScrollPosition > pageHeight) {
        currentScrollPosition = pageHeight;
      }

      window.scrollTo(0, currentScrollPosition);

      if (currentScrollPosition < pageHeight) {
        window.requestAnimationFrame(scrollPage);
      } 
      else {
        let nextPage = document.querySelector('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view');
        // the scrolling animation has completed, click the button if it's not disabled
        if (nextPage.disabled) {
         console.log("Cannot click to go to next page");
          continueScraping = false;
          sendResponse({ message: "No more data to scrape" });
        } 
        else {
          nextPage.click();
        }
      }
    }

    const distancePerFrame = (pageHeight - currentScrollPosition) / (animationDuration / 1000 * framesPerSecond);

    window.requestAnimationFrame(scrollPage);
    resolve();
  });
  
}





// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

//   continueScraping = true;

//   // executes the following block when user sends a request to begin scraping
//   if (request.requestType === "scrapeLeads") {
//     console.log("recieved request from popup script to initiate scraping");

//     let scrapedData = [];
//     while (continueScraping) {

//       let leads = document.querySelectorAll('.entity-result');

//       for (let i = 0; i < leads.length; i++) {

//         if (leads[i].querySelector('.artdeco-button__text').innerText == 'Connect') {

//           let leadName = leads[i].querySelector('.app-aware-link > span > span').innerText;
//           let leadFirstName = leadName.split(' ')[0];
//           let leadLastName = leadName.split(' ', 2)[1];
//           let leadTitle = leads[i].querySelector('.entity-result__primary-subtitle.t-14.t-black.t-normal').innerText;
//           let leadProfileLink = leads[i].querySelector('.app-aware-link').href;
//           let leadImageElement = leads[i].querySelector('.presence-entity.presence-entity--size-3 img');
//           let leadImage = leadImageElement ? leadImageElement.getAttribute('src') : '';

//           let leadData = {
//             fullName: leadName,
//             firstName: leadFirstName,
//             lastName: leadLastName,
//             title: leadTitle,
//             profileLink: leadProfileLink,
//             image: leadImage
//           };

//           scrapedData.push(leadData);
//         }
//       }

//       // sending response back to popup script
//       sendResponse({ message: scrapedData });
//       console.log(scrapedData);

//       const pageHeight = document.body.scrollHeight;
//       const animationDuration = 1000; // in milliseconds
//       const framesPerSecond = 60;

//       let currentScrollPosition = window.scrollY; // get the current scroll position

//       function scrollPage() {
//         currentScrollPosition += distancePerFrame;

//         if (currentScrollPosition > pageHeight) {
//           currentScrollPosition = pageHeight;
//         }

//         window.scrollTo(0, currentScrollPosition);

//         if (currentScrollPosition < pageHeight) {
//           window.requestAnimationFrame(scrollPage);
//         } else {
//           let nextPage = document.querySelector('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view');
//           // the scrolling animation has completed, click the button if it's not disabled
//           if (nextPage.disabled) {
//             console.log("Cannot click to go to next page");
//             continueScraping = false;
//             sendResponse({ message: "No more data to scrape" });
//           } else {
//             nextPage.click();
//           }
//         }
//       }

//       const distancePerFrame = (pageHeight - currentScrollPosition) / (animationDuration / 1000 * framesPerSecond);

//       window.requestAnimationFrame(scrollPage);

      /*
      // Scroll to the bottom of the page with a smooth transition
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });
      // Wait for the scrolling animation to finish before executing other code
      setTimeout(() => {}, 2000);

      let nextPage = document.querySelector('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view');
      if (nextPage.disabled) {
        //console.log("cannot click to go to next page");
        continueScraping = false;
        sendResponse({ message: "No more data to scrape" });
      }
      else {
        //setTimeout(nextPage.click(), 2000);
        nextPage.click();
      }
  //     */
  //     chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //       if (request.requestType === "pauseScraping") {
  //         console.log("recieved request from popup script to pause scraping");
  //         continueScraping = false;
  //         sendResponse({ message: "scraping paused" });
  //         return true;
  //       }
  //       if (request.requestType === "stopScraping") {
  //         console.log("recieved request from popup script to stop scraping");
  //         continueScraping = false;
  //         sendResponse({ message: "scraping completed" });
  //         return true;
  //       }
  //     });
  //   }
  // }

 
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



// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

//   let scrapedData = [];
//   let  continueScraping = true;
//   let isScraping = false;
//   let 

//   switch (request.requestType) {
//     case "scrapeLeads":
//       scrapedData = scraping(); // calls function to scrape leads from current page
//       sendResponse({ data: scrapedData });
//       goToNextPage(); // calls function to scroll and go to next page

//     case "stopScraping":
//       continueScraping = false;

//     case "pauseScraping":
//       continueScraping = false;

//     case "resumeScraping":
//       scrapedData = scraping(); // calls function to scrape leads from current page
//       sendResponse({ data: scrapedData });
//       goToNextPage();// calls function to scroll and go to next page
//   }

// });