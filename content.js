let scrapedData = [];
let isPaused = false;
let isStopped = false;

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "popup-to-content") {
    console.log("established connection with port");
    port.onMessage.addListener(async function(request) {
      if (request.action === "Start Scraping") {
        console.log('receieved request from popup to begin scraping');
            scrapedData = await scraping(scrapedData);
            port.postMessage({ message: "Scraped one page", data: scrapedData });
            await scroll();
            await goToNextPage();
      //   while (!isStopped) {
      //     if (!isPaused) {
      //       scrapedData = await scraping(scrapedData);
      //       port.postMessage({ message: "Scraped one page", data: scrapedData });
      //       await scroll();
      //       await goToNextPage();
      //     }
      //     else {
      //       console.log('scraping paused');
      //       await new Promise(resolve => setTimeout(resolve, 1000));
      //     }
      //   }
      }

      else if (request.action === "Pause Scraping") {
        console.log('receieved request from popup to pause scraping');
        isPaused = true;
      }

      else if (request.action === "Stop Scraping") {
        console.log('receieved request from popup to stop scraping');
        isStopped = true;
        port.postMessage({ message: "Stopped Scraping", data: scrapedData });
      }

      else if (request.action === "Resume Scraping") {
        console.log('receieved request from popup to resume scraping');
        isPaused = false;
      }
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

// chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
//   if (request.requestType === "scrapeLeads") {
//     console.log('receieved request from popup to begin scraping');
    
//     scrapedData = await scraping(scrapedData);
//     sendResponse({ message: "scraped one page", data: scrapedData });
//     await scroll();
//     await goToNextPage();
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
async function scraping(scrapedData) {

  //while (!isPaused && !isStopped) {
    let leads = document.querySelectorAll('.entity-result');

    for (let i = 0; i < leads.length; i++) {

      if (leads[i].querySelector('.artdeco-button__text').innerText == 'Connect') {

        let leadName = leads[i].querySelector('.app-aware-link > span > span').innerText;
        let leadFirstName = leadName.split(' ')[0];
        let leadLastName = leadName.split(' ').pop();
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
    
    // if (isPaused) {
    //   console.log("Action has been paused.");
    //   return;
    // }
    // if (isStopped) {
    //   console.log("Action has been stopped.");
    //   return;
    // }
    
    
    // if (!isPaused) {
    //   scraping(scrapedData);
    // }
    }
    console.log(scrapedData);
    return Promise.resolve(scrapedData);
}


async function scroll() {
  return new Promise(resolve => {
    // Wait for 3 seconds before scrolling down to the bottom of the page
    setTimeout(function() {
      // Scroll down to the bottom of the page smoothly
      document.body.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }, 3000);

    // Wait for 6 seconds before scrolling back to the top of the page
    setTimeout(function() {
      // Scroll back to the top of the page smoothly
      document.body.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });

      // Resolve the promise after the scrolling animation has completed
      resolve();
    }, 5000);
  });
}



async function goToNextPage() {
  return new Promise(resolve => {
    // Wait for 3 seconds before clicking the button
    setTimeout(function() {
      let nextPage = document.querySelector('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view');

      // Check if the button is disabled
      if (nextPage.disabled) {
        console.log("Cannot click to go to next page");
        // Resolve the promise anyway, since we're not actually clicking the button
        resolve();
      } 
      else {
        nextPage.click();
        // Resolve the promise after the button has been clicked
        resolve();
      }
    }, 3000);
  });
}




// function to scroll to to the bottom of the page and click on Next Page
// const goToNextPage = () => {
//   return new Promise(resolve => {
//     const pageHeight = document.body.scrollHeight;
//     const animationDuration = 2000; // in milliseconds
//     const framesPerSecond = 60;

//     let currentScrollPosition = window.scrollY; // get the current scroll position

//     function scrollPage() {
//       currentScrollPosition += distancePerFrame;

//       if (currentScrollPosition > pageHeight) {
//         currentScrollPosition = pageHeight;
//       }

//       window.scrollTo(0, currentScrollPosition);

//       if (currentScrollPosition < pageHeight) {
//         window.requestAnimationFrame(scrollPage);
//       } 
//       else {
//         let nextPage = document.querySelector('.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view');
//         // the scrolling animation has completed, click the button if it's not disabled
//         if (nextPage.disabled) {
//          console.log("Cannot click to go to next page");
//           //continueScraping = false;
//           sendResponse({ message: "No more data to scrape" });
//         } 
//         else {
//           nextPage.click();
//         }
//       }
//     }

//     const distancePerFrame = (pageHeight - currentScrollPosition) / (animationDuration / 1000 * framesPerSecond);

//     window.requestAnimationFrame(scrollPage);
//     resolve();
//   });
  
// }








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