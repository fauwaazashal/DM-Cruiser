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
let activityStatus = "pending";
let campaignCount = 0;



//---------------------------------------------newsearch.html--------------------------------------------------



if (window.location.href.includes("newsearch.html")) {
	console.log('this is newsearch.html');
	const startScrapeFooter = document.querySelector(".start-search-footer");
	const stopScrapeFooter = document.querySelector(".stop-search-footer");
	const pauseScrapeFooter = document.querySelector(".pause-search");
	const resumeScrapeFooter = document.querySelector(".resume-search");
	const newmessageTemplateDiv = document.querySelector(".newmessage-popup");
	const newsearchDiv = document.querySelector(".newsearch-popup");
	const closeButtonNewsearch = document.querySelector(".newsearch-popup .close-btn");
	const closeButtonNewmessage = document.querySelector(".newmessage-popup .close-btn");

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const port = chrome.tabs.connect(tabs[0].id, { name: "popup-to-content" });
		console.log("created port between popup & content scripts");

		// button is clicked to start scraping
		document.querySelector("#start-search-btn").addEventListener("click", () => {
			startScrapeFooter.classList.add("hide");
			stopScrapeFooter.classList.remove("hide");
			pauseScrapeFooter.classList.remove("hide");

			// if (tabs[0].url.includes("https://www.linkedin.com/search/results/people")) {}

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
					await injectOntoNewsearch(injectData);
					document.querySelector(".collected h6").innerText = `Collected: ${scrapedData.length}`;
				}
			});
		})
		
		// button is clicked to stop scraping and now user has to create messsage template & campaign name
		document.querySelector("#stop-search-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.remove("hide");
			newsearchDiv.classList.add("hide");
			newmessageTemplateDiv.classList.remove("hide");
	
			console.log("sent request to content script to stop scraping");
			port.postMessage({ action: "Stop Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Stopped Scraping" ) {
					chrome.storage.local.get(null, async (items) => {
						campaignCount = Object.keys(items).length;
						console.log(Object.keys(items).length);

						newmessageTemplateDiv.querySelector("#campaign-name").value = `Campaign ${campaignCount + 1}`;
						newmessageTemplateDiv.querySelector("#message-input").value = "Hey {first_name}, \nI hope this message finds you well. We just recently finished developing a website for one of your competitors Archf.in, are you looking to upgrade your website?. If so, I'd love to understand your business and help.\n\nBest Regards \n{my_name} \nskitmedia.in";
						});					  
				}
			});
		})

		// button is clicked to pause scraping
		document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.remove("hide");
			
			console.log("sent request to content script to pause scraping");
			port.postMessage({ action: "Pause Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Paused Scraping" ) {
					
				}
			});
		})
	
		// button is clicked to resume scraping
		document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.remove("hide");
			resumeScrapeFooter.classList.add("hide");
			
			port.postMessage({ action: "Resume Scraping" });

			port.onMessage.addListener(function(response) {
				if (response.message === "Resumed Scraping" ) {
					
				}
			});
		})

		// button is clicked to complete campaign creation and store data in local storage
		document.querySelector("#campaign-creation-completed").addEventListener("click", async () => {
			campaignName = newmessageTemplateDiv.querySelector("#campaign-name").value;
			messageTemplate = newmessageTemplateDiv.querySelector("#message-input").value;
			date = new Date().toLocaleDateString("en-IN");

			await storeData(scrapedData, campaignName, messageTemplate, date, activityStatus);
			console.log("data stored in local storage successfully");

			newmessageTemplateDiv.classList.add("hide");
			newsearchDiv.classList.remove("hide");
			startScrapeFooter.classList.remove("hide");
			stopScrapeFooter.classList.add("hide");
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.add("hide");
			document.querySelector(".collected h6").innerText = "Collected: 0";
			injectRemove(document.querySelectorAll(".leads-scraped"));

			window.location.href = "home.html";
		})

		// button is clicked to go from message page back to newsearch page
		newmessageTemplateDiv.querySelector(".back").addEventListener("click", () => {
			newsearchDiv.classList.remove("hide");
			newmessageTemplateDiv.classList.add("hide");
		})

		// button is clicked to go from newsearch page back to home page
		newsearchDiv.querySelector(".back").addEventListener("click", () => {
			startScrapeFooter.classList.remove("hide");
			stopScrapeFooter.classList.add("hide");
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.add("hide");
			injectRemove(document.querySelectorAll(".leads-scraped"));

			window.location.href = "home.html";
		})

		// button is clicked to close the popup
		closeButtonNewsearch.addEventListener("click", function() {
			window.close();
		});

		closeButtonNewmessage.addEventListener("click", function() {
			window.close();
		});

	});
}



//-------------------------------------------------home.html----------------------------------------------------



if (window.location.href.includes("home.html")) {
	console.log('this is home.html');

	// retreive data of all created campaigns from the local storage
	chrome.storage.local.get(null, async (items) => {
  		keys = Object.keys(items);
		await injectOntoHome(keys);
		console.log(document.querySelectorAll(".campaign-box"));

		let campaigns = document.querySelectorAll(".campaign-box");

		for (let i = 0; i < campaigns.length; i++) {
			campaigns[i].addEventListener("click", () => {
				campaignName = campaigns[i].querySelector(".campaign-name").innerText;
				sessionStorage.setItem("campaignName", campaignName);
				window.location.href = "activity.html";
			});
		}
	});

	// button is clicked to close the popup
	const closeButtonHome = document.querySelector(".close-btn");
	closeButtonHome.addEventListener("click", function() {
		window.close();
	});
}



//-----------------------------------------------activity.html-------------------------------------------------



if (window.location.href.includes("activity.html")) {
	console.log('this is activity.html');
	campaignName = sessionStorage.getItem("campaignName");

	// retreive data of the selected campaign from the local storage
	chrome.storage.local.get([campaignName], async (result) => {
		console.log(campaignName);
		await injectOntoActivityTab(result[campaignName].scrapedData, result[campaignName].activityStatus);
		await injectOntoMessageTab(campaignName, result[campaignName].messageTemplate);
		await injectOntoPeopleTab(result[campaignName].scrapedData);
	});

	// Use a promise to make sure campaignName is set before retrieving data from chrome.storage.local
	// new Promise((resolve) => {
	// 	resolve();
	// }).then(async () => {
	// 	let result = await chrome.storage.local.get([campaignName]);
	// 	console.log(campaignName);
	// 	await injectOntoActivityTab(result.campaignName.scrapedData, result.campaignName.activityStatus);
	// 	await injectOntoMessageTab(campaignName, result.campaignName.messageTemplate);
	// 	await injectOntoPeopleTab(result.campaignName.scrapedData);
	// });


	// inject the campaign name and the message template onto the message page

	const activitySection = document.querySelector(".activty-section");
	const messageSection = document.querySelector(".message-section");
	const peopleSection = document.querySelector(".people-section");
	const activityFooter = document.querySelector(".activty-popup");
	const messageFooter = document.querySelector(".message-popup");
	const peopleFooter = document.querySelector(".people-popup");
	const closeButtonActivity = document.querySelector(".close-btn");

	// clicks on activity tab
	document.querySelector("#activity-btn").addEventListener("click", () => {
		activitySection.classList.remove("hide");
		messageSection.classList.add("hide");
		peopleSection.classList.add("hide");

		// activityFooter.classList.remove("hide");
		// messageFooter.classList.add("hide");
		// peopleFooter.classList.adde("hide");
	});

	// clicks on message tab
	document.querySelector("#message-btn").addEventListener("click", () => {
		activitySection.classList.add("hide");
		messageSection.classList.remove("hide");
		peopleSection.classList.add("hide");

		activityFooter.classList.add("hide");
		messageFooter.classList.remove("hide");
		peopleFooter.classList.add("hide");
	});

	// clicks on people tab
	document.querySelector("#people-btn").addEventListener("click", () => {
		activitySection.classList.add("hide");
		messageSection.classList.add("hide");
		peopleSection.classList.remove("hide");

		// activityFooter.classList.add("hide");
		// messageFooter.classList.add("hide");
		// peopleFooter.classList.remove("hide");
	});

	// clicks on back btn to go back to home page
	document.querySelector(".back").addEventListener("click", () => {
		activitySection.classList.remove("hide");
		messageSection.classList.add("hide");
		peopleSection.classList.add("hide");

		// activityFooter.classList.remove("hide");
		// messageFooter.classList.add("hide");
		// peopleFooter.classList.adde("hide");

		//remove campaign's content from activity tab
		injectRemove(document.querySelectorAll(".leads-scraped"));
		//remove campaign's content from people tab
		injectRemove(document.querySelectorAll(".leads-scraped"));

		window.location.href = "home.html";
	});

	// // btn to remove a lead from scraped list
	// document.querySelector(".remove-btn").addEventListener("click", () => {
	// 	//add code that deletes/pops the partcular leads's contents from the storage
	// });

	// // button is clicked to close the popup
	closeButtonActivity.addEventListener('click', function() {
		window.close();
	});
}



//---------------------------------------------content injection------------------------------------------------



// function for injecting data of scraped leads onto newsearch.html
async function injectOntoNewsearch(data) {
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
// async function injectOntoHome(keys) {
  
// 	const campaigns = document.querySelector(".campaigns-section");
  
// 	for (let i = 0; i < keys.length; i++) {
// 		chrome.storage.local.get([keys[i]], function(result) {
// 			let storedScrapedData = result[keys[i]].scrapedData;
// 			let storedDate = result[keys[i]].date;
		
// 			// create new div element for newly created campaign
// 			const campaignDiv = document.createElement("div");
// 			campaignDiv.classList.add("campaign-box");
		
// 			// create campaign info (name + status) element and add to campaignDiv
// 			const campaignInfo = document.createElement("div");
// 			campaignInfo.classList.add("campaign-info");
// 			// create campaign name element and add to campaignInfo
// 			const campName = document.createElement("div");
// 			campName.classList.add("campaign-name");
// 			campName.innerText = keys[i];
// 			campaignInfo.appendChild(campName);
// 			// create activity status element and add to campaignInfo
// 			const campaignStatus = document.createElement("div");
// 			campaignStatus.classList.add("activity-status");
// 			campaignStatus.innerText = `1 of ${storedScrapedData.length}`;
// 			campaignInfo.appendChild(campaignStatus);
// 			// appending campaign info (name + status) to campaignDiv
// 			campaignDiv.appendChild(campaignInfo);
		
// 			// create date element and add it to campaignDiv
// 			const campaignDate = document.createElement("div");
// 			campaignDate.classList.add("date");
// 			campaignDate.innerText = storedDate;
// 			campaignDiv.appendChild(campaignDate);
		
// 			// create delete button and add it to campaignDiv
// 			const deleteCampaign = document.createElement("div");
// 			deleteCampaign.classList.add("delete-btn");
// 			const deleteBtnImage = document.createElement("img");
// 			deleteBtnImage.classList.add("delete-btn-img");
// 			deleteBtnImage.setAttribute("src", "assets/delete.png");
// 			deleteCampaign.appendChild(deleteBtnImage);
// 			campaignDiv.appendChild(deleteCampaign);
		
// 			campaigns.appendChild(campaignDiv);
// 		});		
// 	}
// 	console.log("injected all created campaigns onto home.html");
// }  
async function injectOntoHome(keys) {
  const campaigns = document.querySelector(".campaigns-section");

  for (let i = 0; i < keys.length; i++) {
    const result = await new Promise(resolve => {
      chrome.storage.local.get([keys[i]], resolve);
    });
    let storedScrapedData = result[keys[i]].scrapedData;
    let storedDate = result[keys[i]].date;

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



// function for injecting selected campaign's data onto activity tab of activity.html
async function injectOntoActivityTab(data, status) {
	let leads = document.querySelector(".activity-leads-section");

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


		// creating activity status element and adding to leadDiv
		const leadStatus = document.createElement("div");
		leadStatus.classList.add("remove-btn");
		leadStatus.innerText = status;
		leadDiv.appendChild(leadStatus);

		leads.appendChild(leadDiv);
	}
}



// function for injecting selected campaign's name and mesg template onto msg tab of activity.html
async function injectOntoMessageTab(name, message) {
	let messageTemplateDiv = document.querySelector(".message-popup");
	messageTemplateDiv.querySelector("#campaign-name").value = name;
	messageTemplateDiv.querySelector("#message-input").value = message;
}


// function for injecting selected campaign's data onto people tab of activity.html
async function injectOntoPeopleTab(data) {
	let leads = document.querySelector(".people-leads-section");

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
async function injectRemove(leadDiv) {
	for (let i = 0; i < leadDiv.length; i++) {
		leadDiv[i].remove();
	}
}



//----------------------------------------------------------------------------------------------------



// function to store created campaign's data in local storage
async function storeData(scrapedData, campaignName, messageTemplate, date, activityStatus){
	chrome.storage.local.set({ [campaignName]: { scrapedData, messageTemplate, date, activityStatus } }); // storing data in local storage
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