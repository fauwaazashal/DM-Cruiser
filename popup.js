document.querySelector("#scrapeButton").addEventListener("click", () => {
  
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {"requestType": "scrapeLeads",  "url": tabs[0].url}, function(response) {
		console.log("Sent request to content script to scrape data");
  
		// receiving a response from the content script confirming that the data has been scraped and stored in the local storage
		//console.log(response.message);
	  });
		
	});
  
  })
  