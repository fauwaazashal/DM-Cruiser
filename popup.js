// // loading previous popup page
// chrome.storage.local.get("lastVisitedPopup", function(data) {
// 	var lastVisitedPopup = data.lastVisitedPopup;
// 	if (lastVisitedPopup) {
// 		chrome.action.setPopup({ popup: lastVisitedPopup.url });
// 		if (lastVisitedPopup.data) {
// 			var currentUrl = lastVisitedPopup.data.url;
// 			// do something with the stored data
// 		}
// 	}
// });



//---------------------------------------------global variables--------------------------------------------------



let scrapedData = [];
let injectData = [];
let keys = [];
let date = "";
let campaignName = "";
let messageTemplate = "";
let campaignCount = 0;



//---------------------------------------------newsearch.html--------------------------------------------------



if (window.location.href.includes("newsearch.html")) {
	console.log('this is newsearch.html');
	const startScrapeBtn = document.querySelector(".start-search-footer");
	const stopScrapeBtn = document.querySelector(".stop-search-footer");
	const pauseScrapeBtn = document.querySelector(".pause-search");
	const resumeScrapeBtn = document.querySelector(".resume-search");
	const messageTemplateDiv = document.querySelector(".newmessage-popup");
	const newsearchDiv = document.querySelector(".newsearch-popup");

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const port = chrome.tabs.connect(tabs[0].id, { name: "popup-to-content" });
		console.log("created port between popup & content scripts");

		// button is clicked to start scraping
		document.querySelector("#start-search-btn").addEventListener("click", () => {
			startScrapeBtn.classList.add("hide");
			stopScrapeBtn.classList.remove("hide");
			pauseScrapeBtn.classList.remove("hide");

			console.log("sent request to content script to start scraping");
			port.postMessage({ action: "Start Scraping" });

			port.onMessage.addListener(async function(response) {
				if (response.message === "Scraped one page" ) {
					console.log(response.data);
					
					// length of the data scraped thus far
					prevIterationData = scrapedData.length;
					// storing all scraped data in this variable
					scrapedData = response.data; 
					// obtaining the length of the data (from reverse) that is to be injected
					injectDataLength = scrapedData.length - prevIterationData;
					// updating the data that needs to be injected in this iteration
					injectData = scrapedData.slice(-injectDataLength);
					console.log(injectData);
					// inject response.data onto popup
					await inject_onto_newsearch(injectData);
					document.querySelector(".collected h6").innerText = `Collected: ${scrapedData.length}`;
				}
			});
		})
		
		// button is clicked to stop scraping and now user has to create messsage template & campaign name
		document.querySelector("#stop-search-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.remove("hide");
			newsearchDiv.classList.add("hide");
			messageTemplateDiv.classList.remove("hide");
	
			console.log("sent request to content script to stop scraping");
			port.postMessage({ action: "Stop Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Stopped Scraping" ) {
					chrome.storage.local.get(null, function(items) {
						campaignCount = Object.keys(items).length;
						console.log(Object.keys(items).length);
						});
					  
					messageTemplateDiv.querySelector("#campaign-name").value = `Campaign ${campaignCount + 1}`;
					messageTemplateDiv.querySelector("#message-input").value = "Hey {first_name}, \nI hope this message finds you well. We just recently finished developing a website for one of your competitors Archf.in, are you looking to upgrade your website?. If so, I'd love to understand your business and help.\n\nBest Regards \n{my_name} \nskitmedia.in";
				}
			});
		})

		// button is clicked to pause scraping
		document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.remove("hide");
			
			console.log("sent request to content script to pause scraping");
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
		document.querySelector("#campaign-creation-completed").addEventListener("click", async () => {
			campaignName = messageTemplateDiv.querySelector("#campaign-name").value;
			messageTemplate = messageTemplateDiv.querySelector("#message-input").value;
			date = new Date().toLocaleDateString("en-IN");

			await storeData(scrapedData, campaignName, messageTemplate, date);
			console.log("data stored in local storage successfully");

			messageTemplateDiv.classList.add("hide");
			newsearchDiv.classList.remove("hide");
			startScrapeBtn.classList.remove("hide");
			stopScrapeBtn.classList.add("hide");
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.add("hide");
			document.querySelector(".collected h6").innerText = "Collected: 0";
			inject_remove(document.querySelectorAll(".leads-scraped"));

			window.location.href = "home.html";
			//await inject_onto_home();
		})

		// button is clicked to go from message page back to newsearch page
		messageTemplateDiv.querySelector(".back").addEventListener("click", () => {
			newsearchDiv.classList.remove("hide");
			messageTemplateDiv.classList.add("hide");
		})

		// button is clicked to go from newsearch page back to home page
		newsearchDiv.querySelector(".back").addEventListener("click", () => {
			startScrapeBtn.classList.remove("hide");
			stopScrapeBtn.classList.add("hide");
			pauseScrapeBtn.classList.add("hide");
			resumeScrapeBtn.classList.add("hide");
			inject_remove(document.querySelectorAll(".leads-scraped"));

			window.location.href = "home.html";
		})
	});
}



//-------------------------------------------------home.html----------------------------------------------------



if (window.location.href.includes("home.html")) {
	console.log('this is home.html');

	inject_onto_home();

	let campaigns = document.querySelectorAll(".campaign-box");

	for (let i = 0; i < campaigns.length; i++) {
		campaigns[i].addEventListener("click", () => {
			campaignName = campaigns[i].innerText;

			// retreive data of the selected campaign from the local storage


			// inject relevant content of selected campaign onto the activity page (activity + people)
			//inject_onto_activity(data);

			// inject the campaign name and the message template onto the message page
			

			window.location.href = "activity.html";
		});
	}
}



//-----------------------------------------------activity.html-------------------------------------------------



if (window.location.href.includes("activity.html")) {
	console.log('this is activity.html');

	const activityTab = document.querySelector(".activty-popup");
	const messageTab = document.querySelector(".message-popup");
	const peopleTab = document.querySelector(".people-popup");
	// const activityBtn = document.querySelector("");
	// const messageBtn = document.querySelector("");
	// const peopleBtn = document.querySelector("");

	// clicks on activity tab
	document.querySelector("#activity-tab").addEventListener("click", () => {
		activityTab.classList.remove("hide");
		messageTab.classList.add("hide");
		peopleTab.classList.add("hide");
	});

	// clicks on message tab
	document.querySelector("#message-tab").addEventListener("click", () => {
		activityTab.classList.add("hide");
		messageTab.classList.remove("hide");
		peopleTab.classList.add("hide");
	});

	// clicks on people tab
	document.querySelector("#people-tab").addEventListener("click", () => {
		activityTab.classList.add("hide");
		messageTab.classList.add("hide");
		peopleTab.classList.remove("hide");
	});

	// clicks on back btn to go back to home page
	document.querySelector(".back").addEventListener("click", () => {
		activityTab.classList.remove("hide");
		messageTab.classList.add("hide");
		peopleTab.classList.add("hide");

		//remove campaign's content from activity tab
		inject_remove();
		//remove campaign's content from people tab
		inject_remove();

		window.location.href = "home.html";
	});

	// btn to remove a lead from scraped list
	document.querySelector(".remove-btn").addEventListener("click", () => {
		//add code that deletes/pops the partcular leads's contents from the storage
	});
}



//---------------------------------------------content injection------------------------------------------------



// function for injecting data of scraped leads onto newsearch.html
async function inject_onto_newsearch(data) {
	let leads = document.querySelector(".leads-section");

	for (let i = 0; i < data.length; i++) {

		// create new div element for each lead
		const leadDiv = document.createElement("div");
		leadDiv.classList.add("leads-scraped");

		// create image element and adding to leadDiv
		const leadImage = document.createElement("div");
		const image = document.createElement("img");
		image.classList.add("lead-image");
		if (data[i].image == "") image.setAttribute("src", "assets/defaultprofile100.png");
		else image.setAttribute("src", data[i].image);
		image.setAttribute("alt", data[i].fullName);
		leadImage.appendChild(image);
		leadDiv.appendChild(leadImage);


		// create info element and adding to leadDiv
		const leadInfo = document.createElement("div");
		// create name element and addding to leadInfo
		const leadName = document.createElement("div");
		leadName.classList.add("lead-name");
		leadName.innerText = data[i].fullName;
		leadName.setAttribute("href", data[i].profileLink);
		leadInfo.appendChild(leadName);
		// create title element and adding to leadInfo
		const leadTitle = document.createElement("div");
		leadTitle.classList.add("lead-title");
		leadTitle.innerText = data[i].title;
		leadInfo.appendChild(leadTitle);
		// appending leadInfo (leadName + leadTitle) to leadDiv
		leadDiv.appendChild(leadInfo);


		// creating delete button element and adding to leadDiv
		const leadDelete = document.createElement("div");
		leadDelete.classList.add("remove-btn");
		leadDelete.innerText = "Remove";
		leadDelete.disabled = true;
		leadDiv.appendChild(leadDelete);

		leads.appendChild(leadDiv);
	}	
}


// function for injecting a button of the newly created campaign onto home.html
async function inject_onto_home() {
	const items = await new Promise(resolve => chrome.storage.local.get(null, resolve));
	const keys = Object.keys(items);
	console.log(keys);
  
	const campaigns = document.querySelector(".campaigns-section");
  
	for (let i = 0; i < keys.length; i++) {
		const result = await new Promise(resolve => chrome.storage.local.get(keys[i], resolve));
		console.log(result);
		const storedScrapedData = result[keys[i]].scrapedData;
		console.log(storedScrapedData);
		const storedDate = result[keys[i]].date;
		console.log(storedDate);
	
		// create new div element for newly created campaign
		const campaignDiv = document.createElement("div");
		campaignDiv.classList.add("campaign-box");
	
		// create campaign info (name + status) element and add to campaignDiv
		const campaignInfo = document.createElement("div");
		campaignInfo.classList.add("campaign-info");
		// create campaign name element and add to campaignInfo
		const campName = document.createElement("div");
		campName.classList.add("campaign-name");
		campName.innerText = keys[i];
		campaignInfo.appendChild(campName);
		// create activity status element and add to campaignInfo
		const campaignStatus = document.createElement("div");
		campaignStatus.classList.add("activity-status");
		campaignStatus.innerText = `1 of ${storedScrapedData.length}`;
		campaignInfo.appendChild(campaignStatus);
		// appending campaign info (name + status) to campaignDiv
		campaignDiv.appendChild(campaignInfo);
	
		// create date element and add it to campaignDiv
		const campaignDate = document.createElement("div");
		campaignDate.classList.add("date");
		campaignDate.innerText = storedDate;
		campaignDiv.appendChild(campaignDate);
	
		// create delete button and add it to campaignDiv
		const deleteCampaign = document.createElement("div");
		deleteCampaign.classList.add("delete-btn");
		const deleteBtnImage = document.createElement("img");
		deleteBtnImage.classList.add("delete-btn-img");
		deleteBtnImage.setAttribute("src", "assets/delete.png");
		deleteCampaign.appendChild(deleteBtnImage);
		campaignDiv.appendChild(deleteCampaign);
	
		campaigns.appendChild(campaignDiv);
	}
  
	console.log("injected all created campaigns onto home.html");
  }
  



// function for injecting selected campaign's data onto activity.html
async function inject_onto_activity(data) {
	inject_onto_newsearch(data); // injects the exact same content that was injected onto newsearch page
	
	// code for injecting onto activty page
	let leads = document.querySelector(".leads-section");

	for (let i = 0; i < data.length; i++) {

		// create new div element for each lead
		const leadDiv = document.createElement("div");
		leadDiv.classList.add("leads-scraped");

		// create image element and adding to leadDiv
		const leadImage = document.createElement("div");
		const image = document.createElement("img");
		image.classList.add("lead-image");
		if (data[i].image == "") image.setAttribute("src", "assets/defaultprofile100.png");
		else image.setAttribute("src", data[i].image);
		image.setAttribute("alt", data[i].fullName);
		leadImage.appendChild(image);
		leadDiv.appendChild(leadImage);


		// create info element and adding to leadDiv
		const leadInfo = document.createElement("div");
		// create name element and addding to leadInfo
		const leadName = document.createElement("div");
		leadName.classList.add("lead-name");
		leadName.innerText = data[i].fullName;
		leadName.setAttribute("href", data[i].profileLink);
		leadInfo.appendChild(leadName);
		// create title element and adding to leadInfo
		const leadTitle = document.createElement("div");
		leadTitle.classList.add("lead-title");
		leadTitle.innerText = data[i].title;
		leadInfo.appendChild(leadTitle);
		// appending leadInfo (leadName + leadTitle) to leadDiv
		leadDiv.appendChild(leadInfo);


		// creating delete button element and adding to leadDiv
		const leadDelete = document.createElement("div");
		leadDelete.classList.add("remove-btn");
		leadDelete.innerText = "Remove";
		leadDiv.appendChild(leadDelete);

		leads.appendChild(leadDiv);
	}
}


// function to remove injected content from the page
async function inject_remove(leadDiv) {
	for (let i = 0; i < leadDiv.length; i++) {
		leadDiv[i].remove();
	}
}



//----------------------------------------------------------------------------------------------------



// function to store created campaign's data in local storage
async function storeData(scrapedData, campaignName, messageTemplate, date){
	chrome.storage.local.set({ [campaignName]: { scrapedData, messageTemplate, date } }); // storing data in local storage
}



//----------------------------------------------------------------------------------------------------



// first draft for popup to content message passing to scrape data

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