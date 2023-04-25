let data = [];
let injectData = [];
let campaignName = "";
let messageTemplate = "";

if (window.location.href.includes("newsearch.html")) {
	console.log('this is newsearch.html');
	const startScrapeBtn = document.querySelector(".start-search-footer");
	const stopScrapeBtn = document.querySelector(".stop-search-footer");
	const pauseScrapeBtn = document.querySelector(".pause-search");
	const resumeScrapeBtn = document.querySelector(".resume-search");
	const messageTemplateDiv = document.querySelector(".message-popup");
	const newsearchDiv = document.querySelector(".newsearch-popup");

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const port = chrome.tabs.connect(tabs[0].id, { name: "popup-to-content" });
		console.log("created port between popup & content scripts");

		// button is clicked to start scraping
		document.querySelector("#start-search-btn").addEventListener("click", () => {
			startScrapeBtn.classList.add("hide");
			stopScrapeBtn.classList.remove("hide");
			pauseScrapeBtn.classList.remove("hide");

			console.log("sent request to content script start scraping");
			port.postMessage({ action: "Start Scraping" });

			port.onMessage.addListener(async function(response) {
				if (response.message === "Scraped one page" ) {
					console.log(response.data);
					// length of the data scraped thus far
					prevIterationData = data.length;
					// storing all scraped data in this variable
					data = response.data; 
					// obtaining the length of the data (from reverse) that is to be injected
					injectDataLength = data.length - prevIterationData;
					// updating the data that needs to be injected in this iteration
					injectData = data.slice(-injectDataLength);
					console.log(injectData);
					// inject response.data onto popup
					await inject_onto_newsearch(injectData);
				}
			});
		})
		
		// button is clicked to stop scraping and now user has to create messsage template & campaign name
		document.querySelector("#stop-search-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.remove("hide");
			newsearchDiv.classList.add("hide");
			messageTemplateDiv.classList.remove("hide");
	
			port.postMessage({ action: "Stop Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Stopped Scraping" ) {
					messageTemplateDiv.getElementById("myInput").value = `Campaign ${campaignCount}`;
					messageTemplateDiv.getElementById("myInput").value = "Hey {first_name}, \nI hope this message finds you well. We just recently finished developing a website for one of your competitors Archf.in, are you looking to upgrade your website?. If so, I'd love to understand your business and help.\n\nBest Regards \n{my_name} \nskitmedia.in";
				}
			});
		})

		// button is clicked to pause scraping
		document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.remove("hide");
			
			port.postMessage({ action: "Pause Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Paused Scraping" ) {
					
				}
			});
		})
	
		// button is clicked to resume scraping
		document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.remove("hide");
			resumeScrapeBtn.classList.add("hide");
			
			port.postMessage({ action: "Resume Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Resumed Scraping" ) {
					
				}
			});
		})

		// button is clicked to complete campaign creation and store data in local storage
		document.querySelector("#campaign-creation-completed").addEventListener("click", () => {
			campaignName = messageTemplateDiv.getElementById("myInput").value;
			messageTemplate = messageTemplateDiv.getElementById("myInput").value;

			// Send the scraped data to the background script and handle any errors
			chrome.runtime.sendMessage({ requestType: "Store data", data: data, keyName: campaignName }, function(response) {
			  console.log("Request sent to background script to store data");
			  // receiving a response from the background script as a confirmation that the data has been stored in the local storage
			  console.log(response.message);       
			});

			window.location.href = "home.html";
		})

		// button is clicked to go back to newsearch page
		messageTemplateDiv.querySelector(".back").addEventListener("click", () => {
			newsearchDiv.classList.remove("hide");
			messageTemplateDiv.classList.add("hide");
		})

		// button is clicked to go back to home page
		newsearchDiv.querySelector(".back").addEventListener("click", () => {
			newsearchDiv.classList.add("hide");
			window.location.href = "home.html";
		})
	});

// 	document.querySelector("#start-search-btn").addEventListener("click", () => {
// 		startScrapeBtn.classList.add("hide");
// 		stopScrapeBtn.classList.remove("hide");
// 		pauseScrapeBtn.classList.remove("hide");

// 		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
// 			chrome.tabs.sendMessage(tabs[0].id, {requestType: "scrapeLeads",  url: tabs[0].url}, function(response) {
// 			  	console.log("Sent request to content script to scrape data");
		
// 			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
// 			  	if (response.message === "scraped one page") {
// 					console.log(response.data);
// 					data = response.data;
// 					inject(data);
// 				}
// 			});
			  
// 		});
// 	})

// 	document.querySelector("#stop-search-btn").addEventListener("click", () => {
// 		pauseScrapeBtn.classList.add("hide");
// 		resumeScrapeBtn.classList.remove("hide");

// 		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
// 			chrome.tabs.sendMessage(tabs[0].id, {"requestType": "stopScraping",  "url": tabs[0].url}, function(response) {
// 				console.log("Sent request to content script to stop scraping");
		
// 			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
// 			  	if (response.message === "scraping completed") {
// 					window.location.href = "new-page.html";
// 			  	}
// 			});			  
// 		});
// 	})

// 	document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
// 		pauseScrapeBtn.classList.add("hide");
// 		resumeScrapeBtn.classList.remove("hide");

// 		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
// 			chrome.tabs.sendMessage(tabs[0].id, {"requestType": "pauseScraping",  "url": tabs[0].url}, function(response) {
// 			  	console.log("Sent request to content script to pause scraping");
		
// 			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
// 			  	//console.log(response.message);
// 			});
 
// 		});
// 	})

// 	document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
// 		pauseScrapeBtn.classList.remove("hide");
// 		resumeScrapeBtn.classList.add("hide");

// 		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
// 			chrome.tabs.sendMessage(tabs[0].id, {"requestType": "resumeScraping",  "url": tabs[0].url}, function(response) {
// 			  	console.log("Sent request to content script to resume scraping");
		
// 			  	//receiving a response from the content script confirming that the data has been scraped and stored in the local storage
// 			  	//console.log(response.message);
// 			});
			  
// 		});
// 	})

}



//----------------------------------------------------------------------------------------------------



// function for injecting data of scraped leads onto newsearch.html
async function inject_onto_newsearch(data) {
	let leads = document.querySelector(".leads-scraped");

	for (let i = 0; i < data.length; i++) {

		// create new div element for each lead
		const leadDiv = document.createElement("div");
		leadDiv.classList.add("lead");

		// create image element and adding to lead div
		const leadImage = document.createElement("div");
		leadImage.classList.add("lead-image");
		leadImage.setAttribute("src", data[i].image);
		leadImage.setAttribute("alt", data[i].fullName);
		leadDiv.appendChild(leadImage);


		// create info element and adding to lead div
		const leadInfo = document.createElement("div");

		// create name element and addding to lead info
		const leadName = document.createElement("div");
		leadName.classList.add("lead-name");
		leadName.innerText = data[i].fullName;
		leadName.setAttribute("href", data[i].profileLink);
		leadInfo.appendChild(leadName);

		// create title element and adding to lead info
		const leadTitle = document.createElement("div");
		leadTitle.classList.add("lead-title");
		leadTitle.innerText = data[i].title;
		leadInfo.appendChild(leadTitle);

		// appending leadInfo (leadName + leadTitle) to lead div
		leadDiv.appendChild(leadInfo);


		// creating delete button element and adding to lead div
		const leadDelete = document.createElement('div');
		leadDelete.classList.add("remove-btn");
		leadDelete.innerText = "Remove";
		leadDiv.appendChild(leadDelete);

		leads.appendChild(leadDiv);
	}	
}

// function for injecting a button of the newly created campaign
// async function inject_onto_home() {

// }

//----------------------------------------------------------------------------------------------------



// code for opening a campaign that we created
// let campaignName = "";

// if (window.location.href.includes("home.html")) {
// 	console.log('this is home.html');
// inject_onto_home();


// 	document.querySelector("div that will contain all future campaign button divs");
// 	let campaigns = document.querySelectorAll("all available/created divs of campaigns");

// 	for (let i = 0; i < campaigns.length; i++) {
// 		campaigns[i].addEventListener("click", () => {
// 			campaignName = campaigns[i].innerText;
// 			window.location.href = "activity.html";
// 		});
// 	}
// }

// code to inject content onto activity.html for when a campaign button is clicked
// - send request to background script and retreive the relevant campaign from the storage
// - after reteirving the data, inject content onto the respectives tabs of activity.html
// - when the back button is clicked, we need to add go back to the home page and remove all the injected conetnt from the activity page



//----------------------------------------------------------------------------------------------------



// code to automate invites, manage leads and update message template


