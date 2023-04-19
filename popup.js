/*document.querySelector("#scrapeButton").addEventListener("click", () => {
  
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {"requestType": "scrapeLeads",  "url": tabs[0].url}, function(response) {
		console.log("Sent request to content script to scrape data");
  
		// receiving a response from the content script confirming that the data has been scraped and stored in the local storage
		//console.log(response.message);
	  });
		
	});
  
})
*/


if (window.location.href.includes("newsearch.html")) {
	console.log('this is newsearch.html');
	const startScrapeBtn = document.querySelector(".start-search-footer");
	const endScrapeBtn = document.querySelector(".end-search-footer");
	const pauseScrapeBtn = document.querySelector(".pause-search");
	const resumeScrapeBtn = document.querySelector(".resume-search");

	document.querySelector("#start-search-btn").addEventListener("click", () => {
		startScrapeBtn.classList.add("hide");
		endScrapeBtn.classList.remove("hide");
		pauseScrapeBtn.classList.remove("hide");

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {"requestType": "scrapeLeads",  "url": tabs[0].url}, function(response) {
			  	console.log("Sent request to content script to scrape data");
		
			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
			  	//console.log(response.message);
			});
			  
		});
	})

	document.querySelector("#end-search-btn").addEventListener("click", () => {
		pauseScrapeBtn.classList.add("hide");
		resumeScrapeBtn.classList.remove("hide");

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {"requestType": "stopScraping",  "url": tabs[0].url}, function(response) {
				console.log("Sent request to content script to stop scraping");
		
			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
			  	if (response.message === "scraping completed") {
					window.location.href = "new-page.html";
			  	}
			});			  
		});
	})

	document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
		pauseScrapeBtn.classList.add("hide");
		resumeScrapeBtn.classList.remove("hide");

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {"requestType": "pauseScraping",  "url": tabs[0].url}, function(response) {
			  	console.log("Sent request to content script to pause scraping");
		
			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
			  	//console.log(response.message);
			});
 
		});
	})

	document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
		pauseScrapeBtn.classList.remove("hide");
		resumeScrapeBtn.classList.add("hide");

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {"requestType": "resumeScraping",  "url": tabs[0].url}, function(response) {
			  	console.log("Sent request to content script to resume scraping");
		
			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
			  	//console.log(response.message);
			});
			  
		});
	})

}

if (window.location.href.includes("message.html")) {
	//console.log('this is home.html');
}