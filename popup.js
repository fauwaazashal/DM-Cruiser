if (window.location.href.includes("newsearch.html")) {
	console.log('this is newsearch.html');
	const startScrapeBtn = document.querySelector(".start-search-footer");
	const stopScrapeBtn = document.querySelector(".stop-search-footer");
	const pauseScrapeBtn = document.querySelector(".pause-search");
	const resumeScrapeBtn = document.querySelector(".resume-search");

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const port = chrome.tabs.connect(tabs[0].id, { name: "popup-to-content" });

		document.querySelector("#start-search-btn").addEventListener("click", () => {
			startScrapeBtn.classList.add("hide");
			stopScrapeBtn.classList.remove("hide");
			pauseScrapeBtn.classList.remove("hide");

			port.postMessage({ action: "Start Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Scraped one page" ) {
					console.log(response.data);
					// inject response.data onto popup
				}
			});
		})

		document.querySelector("#stop-search-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.remove("hide");
	
			port.postMessage({ action: "Stop Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Stopped Scraping" ) {
					
				}
			});
		})

		document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.remove("hide");
			
			port.postMessage({ action: "Pause Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Paused Scraping" ) {
					
				}
			});
		})
	
		document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.remove("hide");
			resumeScrapeBtn.classList.add("hide");
			
			port.postMessage({ action: "Resume Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Resumed Scraping" ) {
					
				}
			});
		})
	});
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


