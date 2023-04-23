if (window.location.href.includes("newsearch.html")) {
	console.log('this is newsearch.html');
	const startScrapeBtn = document.querySelector(".start-search-footer");
	const endScrapeBtn = document.querySelector(".end-search-footer");
	const pauseScrapeBtn = document.querySelector(".pause-search");
	const resumeScrapeBtn = document.querySelector(".resume-search");
	//const port = chrome.tabs.connect(tabs[0].id, { name: "popup-to-content" });

	document.querySelector("#start-search-btn").addEventListener("click", () => {
		startScrapeBtn.classList.add("hide");
		endScrapeBtn.classList.remove("hide");
		pauseScrapeBtn.classList.remove("hide");

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			const port = chrome.tabs.connect(tabs[0].id, { name: "popup-to-content" });
			port.postMessage({ action: "Start Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Scraped one page" ) {
					console.log(response.data);
					// inject response.data onto popup
				}
			});

			// chrome.tabs.sendMessage(tabs[0].id, {"requestType": "scrapeLeads",  "url": tabs[0].url}, function(response) {
			//   	console.log("Sent request to content script to scrape data");
				
			  	//receiving a response from the content script confirming that the data has been scraped and can now be injected onto our popup script
				//   if (chrome.runtime.lastError) {
				// 	console.error(chrome.runtime.lastError);
				//   } else {
				// 	console.log(response.data);
				//   }

				//injecting scraped content onto popup script one by one for every page that is scraped
				
			// });
			  
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
					window.location.href = "message.html";
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
	//console.log('this is message.html');
}



//----------------------------------------------------------------------------------------------------



// code for injecting data of scraped leads onto newsearch.html
// let leads = document.getElementByClass("leads-scraped");

// 	for (let i = 0; i < data.length; i++) {

// 	// create new div element for each lead
// 	const leadDiv = document.createElement("div");
// 	leadDiv.classList.add("lead");

// 	// create image element and adding to lead div
// 	const leadImage = document.createElement("div");
// 	leadImage.classList.add("lead-image");
// 	leadImage.setAttribute("src", data[i].image);
// 	leadImage.setAttribute("alt", data[i].fullName);
// 	leadDiv.appendChild(leadImage);


// 	// create info element and adding to lead div
// 	const leadInfo = document.createElement("div");

// 	// create name element and addding to lead info
// 	const leadName = document.createElement("div");
// 	leadName.classList.add("lead-name");
// 	leadName.innerText = data.fullName[i];
// 	leadName.setAttribute("href", data[i].profileLink);
// 	leadInfo.appendChild(leadName);

// 	// create title element and adding to lead info
// 	const leadTitle = document.createElement("div");
// 	leadTitle.classList.add("lead-title");
// 	leadTitle.innerText = data[i].title;
// 	leadInfo.appendChild(leadTitle);

// 	// appending leadInfo (leadName + leadTitle) to lead div
// 	leadDiv.appendChild(leadInfo);


// 	// creating delete button element and adding to lead div
// 	const leadDelete = document.createElement('div');
// 	leadDelete.classList.add("remove-btn");
// 	leadDelete.innerText = "Remove";
// 	leadDiv.appendChild(leadDelete);

// 	}

// leads.appendChild(leadDiv);



//----------------------------------------------------------------------------------------------------



// code for opening a campaign that we created
let campaignName = "";

if (window.location.href.includes("home.html")) {
	console.log('this is home.html');
	document.querySelector("div that will contain all future campaign button divs");
	let campaigns = document.querySelectorAll("all available/created divs of campaigns");

	for (let i = 0; i < campaigns.length; i++) {
		campaigns[i].addEventListener("click", () => {
			campaignName = campaigns[i].innerText;
			window.location.href = "activity.html";
		});
	}
}
// code to inject content onto activity.html for when a campaign button is clicked
// - send request to background script and retreive the relevant campaign from the storage
// - after reteirving the data, inject content onto the respectives tabs of activity.html
// - when the back button is clicked, we need to add go back to the home page and remove all the injected conetnt from the activity page



//----------------------------------------------------------------------------------------------------



// code to automate invites, manage leads and update message template


