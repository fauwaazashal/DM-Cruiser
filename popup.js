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


if (window.location.pathname == "/newsearch.html") {

	const startScrapeBtn = document.querySelector("#start-search-footer");
	const endScrapeBtn = document.querySelector("#end-search-footer");
	const pauseScrapeBtn = document.querySelector("#pause-search");
	const resumeScrapeBtn = document.querySelector("#resume-search");

	document.querySelector("#start-scrape-btn").addEventListener("click", () => {
		startScrapeBtn.classList.add("hide");
		endScrapeBtn.classList.remove("hide");
		pauseScrapeBtn.classList.remove("hide");
	})

	document.querySelector("#end-scrape-btn").addEventListener("click", () => {
		startScrapeBtn.classList.remove("hide");
		endScrapeBtn.classList.add("hide");
		pauseScrapeBtn.classList.add("hide");
		resumeScrapeBtn.classList.add("hide");
	})

	document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
		pauseScrapeBtn.classList.add("hide");
		resumeScrapeBtn.classList.remove("hide");
	})

	document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
		pauseScrapeBtn.classList.remove("hide");
		resumeScrapeBtn.classList.add("hide");
	})

}

/*else if (window.location.pathname == "/activity.html") {

}*/