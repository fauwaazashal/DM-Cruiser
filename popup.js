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
//let leadsBox = [];
let date = "";
let campaignName = "";
let messageTemplate = "";
let activityStatus = "";
let campaignCount = 0;
let pendingCount = 0;
let sentCount = 0;



//---------------------------------------------newsearch.html--------------------------------------------------



if (window.location.href.includes("newsearch.html")) {
	console.log('this is newsearch.html');
	const startScrapeFooter = document.querySelector(".start-search-footer");
	const stopScrapeFooter = document.querySelector(".stop-search-footer");
	const pauseScrapeFooter = document.querySelector(".pause-search");
	const resumeScrapeFooter = document.querySelector(".resume-search");
	const loadingContainer = document.querySelector(".loading-container");
	const newmessageTemplateDiv = document.querySelector(".newmessage-popup");
	const newsearchDiv = document.querySelector(".newsearch-popup");
	const inputElement = document.querySelector("#campaign-name");
	const closeButtonNewsearch = document.querySelector(".newsearch-popup .close-btn");
	const closeButtonNewmessage = document.querySelector(".newmessage-popup .close-btn");

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		const scrapePort = chrome.tabs.connect(tabs[0].id, { name: "scrape leads" });
		console.log("created port between popup & content scripts to scrape leads");

		// button is clicked to start scraping
		document.querySelector("#start-search-btn").addEventListener("click", () => {
			startScrapeFooter.classList.add("hide");
			stopScrapeFooter.classList.remove("hide");
			pauseScrapeFooter.classList.remove("hide");
			loadingContainer.classList.remove("hide");

			console.log("sent request to content script to start scraping");
			scrapePort.postMessage({ action: "Start Scraping" });

			scrapePort.onMessage.addListener(async function(response) {
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
					
					// scrolls to bottom of leads section to show latest list of leads that were scraped
					setTimeout(() => {
						const section = document.querySelector(".leads-section");
						section.scrollTo({
							top: section.scrollHeight,
							behavior: "smooth"
						});
					}, 1000);

					// displays the numbers of leads that have been scraped
					document.querySelector(".collected h6").innerText = `Collected: ${scrapedData.length}`;
				}
			});
		})
		
		// button is clicked to stop scraping and now user has to create messsage template & campaign name
		document.querySelector("#stop-search-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.remove("hide");
			loadingContainer.classList.add("hide");
			newsearchDiv.classList.add("hide");
			newmessageTemplateDiv.classList.remove("hide");
	
			console.log("sent request to content script to stop scraping");
			scrapePort.postMessage({ action: "Stop Scraping" });

			scrapePort.onMessage.addListener(function(response) {
				if (response.message === "Stopped Scraping" ) {
					chrome.storage.local.get(null, async (items) => {
						campaignCount = Object.keys(items).length;
						console.log(Object.keys(items).length);

						newmessageTemplateDiv.querySelector("#campaign-name").value = `Campaign ${campaignCount + 1}`;
						newmessageTemplateDiv.querySelector("#message-input").value = "Hey {first_name}, \nI hope this message finds you well. We just recently finished developing a website for one of your competitors Archf.in, are you looking to upgrade your website?. If so, I'd love to understand your business and help.\n\nBest Regards \n{my_name} \nskitmedia.in";
						
						// placeholder buttons functionality
						//first name
						document.querySelector("#firstName").addEventListener("click", () => {
							var textarea = document.getElementById("message-input");
							var textToAdd = "{first_name}";
						
							// Get the current cursor position
							var startPos = textarea.selectionStart;
							var endPos = textarea.selectionEnd;
						
							// Insert the text at the cursor position
							textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
						
							// Move the cursor to the end of the inserted text
							textarea.focus(); // Set focus on the textarea
							textarea.selectionStart = startPos + textToAdd.length;
							textarea.selectionEnd = startPos + textToAdd.length;
						});
						
						//last name
						document.querySelector("#lastName").addEventListener("click", () => {
							var textarea = document.getElementById("message-input");
							var textToAdd = "{last_name}";

							// Get the current cursor position
							var startPos = textarea.selectionStart;
							var endPos = textarea.selectionEnd;

							// Insert the text at the cursor position
							textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);

							// Move the cursor to the end of the inserted text
							textarea.focus(); // Set focus on the textarea
							textarea.selectionStart = startPos + textToAdd.length;
							textarea.selectionEnd = startPos + textToAdd.length;
						});
						//full name
						document.querySelector("#fullName").addEventListener("click", () => {
							var textarea = document.getElementById("message-input");
							var textToAdd = "{full_name}";

							// Get the current cursor position
							var startPos = textarea.selectionStart;
							var endPos = textarea.selectionEnd;

							// Insert the text at the cursor position
							textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);

							// Move the cursor to the end of the inserted text
							textarea.focus(); // Set focus on the textarea
							textarea.selectionStart = startPos + textToAdd.length;
							textarea.selectionEnd = startPos + textToAdd.length;
						});
						//job title
						document.querySelector("#jobTitle").addEventListener("click", () => {
							var textarea = document.getElementById("message-input");
							var textToAdd = "{job_title}";

							// Get the current cursor position
							var startPos = textarea.selectionStart;
							var endPos = textarea.selectionEnd;

							// Insert the text at the cursor position
							textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);

							// Move the cursor to the end of the inserted text
							textarea.focus(); // Set focus on the textarea
							textarea.selectionStart = startPos + textToAdd.length;
							textarea.selectionEnd = startPos + textToAdd.length;
						});
					});					  
				}
			});
		})

		// button is clicked to pause scraping
		document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.remove("hide");
			loadingContainer.classList.add("hide");
			
			console.log("sent request to content script to pause scraping");
			scrapePort.postMessage({ action: "Pause Scraping" });

			scrapePort.onMessage.addListener(function(response) {
				if (response.message === "Paused Scraping" ) {
					
				}
			});
		})

		// handling click of enter key inside the input tag
		inputElement.addEventListener("keypress", (event) => {
			if (event.key === "Enter") event.preventDefault();
		});
	
		// button is clicked to resume scraping
		document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.remove("hide");
			resumeScrapeFooter.classList.add("hide");
			loadingContainer.classList.remove("hide");
			
			scrapePort.postMessage({ action: "Resume Scraping" });

			scrapePort.onMessage.addListener(function(response) {
				if (response.message === "Resumed Scraping" ) {
					
				}
			});
		})

		// button is clicked to complete campaign creation and store data in local storage
		document.querySelector("#save-campaign").addEventListener("click", async () => {
			campaignName = newmessageTemplateDiv.querySelector("#campaign-name").value;
			messageTemplate = newmessageTemplateDiv.querySelector("#message-input").value;
			date = new Date().toLocaleDateString("en-IN");

			await storeCampaignData(scrapedData, campaignName, messageTemplate, date);

			newmessageTemplateDiv.classList.add("hide");
			newsearchDiv.classList.remove("hide");
			startScrapeFooter.classList.remove("hide");
			stopScrapeFooter.classList.add("hide");
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.add("hide");
			loadingContainer.classList.add("hide");
			document.querySelector(".collected h6").innerText = "Collected: 0";
			injectRemove(document.querySelectorAll(".leads-scraped"));

			scrapePort.disconnect();
			console.log("disconnected port connection");

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

	(async () => {
		await injectOntoHome();

		console.log(document.querySelectorAll(".campaign-box"));

		// button is clicked to open the activity page of selected campaign
		let campaigns = document.querySelectorAll(".campaign-box");
		for (let i = 0; i < campaigns.length; i++) {
			campaigns[i].addEventListener("click", (event) => {
				// Check if the delete button was clicked
				if (!event.target.classList.contains("delete-campaign-btn")) {
				campaignName = campaigns[i].querySelector(".campaign-name").innerText;
				// store campaignName in session storage so that it accessible even on activity.html
				sessionStorage.setItem("campaignName", campaignName);
				window.location.href = "activity.html";
				}
			});

			// storing refernces of the delete btn, cancel delete btn and confirm delete btn
			let deleteCampaignBtn = campaigns[i].querySelector(".delete-campaign-btn");
			let confirmDeleteBtn = campaigns[i].querySelector(".confirm-delete-btn");
			let cancelDeleteBtn = campaigns[i].querySelector(".cancel-delete-btn");

			// Add click event listener to the delete button
			campaigns[i].querySelector(".delete-campaign-btn").addEventListener("click", async (event) => {
				// Stop the event propagation to prevent the parent div's click event from being triggered
				event.stopPropagation();
				
				deleteCampaignBtn.classList.add("hide");
				confirmDeleteBtn.classList.remove("hide");
				cancelDeleteBtn.classList.remove("hide");				
			});

			// btn is clicked to confirm the deleting of the campaign
			campaigns[i].querySelector(".confirm-delete-btn").addEventListener("click", async (event) => {
				// Stop the event propagation to prevent the parent div's click event from being triggered
				event.stopPropagation();

				campaignName = campaigns[i].querySelector(".campaign-name").innerText;
				// call function to delete selected campaign
				await deleteCampaignData(campaignName);
				// Delete the parent div
				campaigns[i].remove();
			});
			
			// btn is clicked to cancel the deleting of the campaign
			campaigns[i].querySelector(".cancel-delete-btn").addEventListener("click", async (event) => {
				// Stop the event propagation to prevent the parent div's click event from being triggered
				event.stopPropagation();
				
				deleteCampaignBtn.classList.remove("hide");
				confirmDeleteBtn.classList.add("hide");
				cancelDeleteBtn.classList.add("hide");
			});
		}
	})();

	// button is clicked to close the popup
	const closeButtonHome = document.querySelector(".close-btn");
	closeButtonHome.addEventListener("click", function() {
		window.close();
	});
}



//-----------------------------------------------activity.html-------------------------------------------------



if (window.location.href.includes("activity.html")) {
	console.log('this is activity.html');

	const activitySection = document.querySelector(".activity-section");
	const messageSection = document.querySelector(".message-section");
	const peopleSection = document.querySelector(".people-section");
	const startInviteFooter = document.querySelector(".start-invite-activity-footer");
	const stopInviteFooter = document.querySelector(".stop-invite-activity-footer");
	const inputElement = document.querySelector("#campaign-name");
	const closeButtonActivity = document.querySelector(".close-btn");

	// retrieve campaignName from session storage
	campaignName = sessionStorage.getItem("campaignName");
	document.querySelector("#heading-activity").innerText = campaignName;
	pendingCount = 0;
	sentCount = 0;

	chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
		const invitePort = chrome.tabs.connect(tabs[0].id, { name: "send invites" });
		console.log("created port between popup & content scripts to send invites");

		await injectOntoActivityTab(campaignName);
		
		// clicks on message tab
		document.querySelector("#message-btn").addEventListener("click", async () => {
			if (messageSection.classList.contains("hide")) {
				activitySection.classList.add("hide");
				messageSection.classList.remove("hide");
				peopleSection.classList.add("hide");

				//await injectRemove();
				await injectOntoMessageTab(campaignName);
			}

			// clicks on btn to save changes made to campaign name and/or message template
			document.querySelector("#save-update-msg-campname-btn").addEventListener("click", async () => {
				
				let messageTemplateDiv = document.querySelector(".message-template");
				let oldCampaignName = campaignName;
				let newCampaignName = messageTemplateDiv.querySelector("#campaign-name").value;
				let newMessageTemplate = messageTemplateDiv.querySelector("#message-input").value;

				await updateCampaignData(oldCampaignName, newCampaignName, newMessageTemplate);
				campaignName = newCampaignName;
				document.querySelector("#heading-activity").innerText = campaignName;
			});

			// handling click of enter key inside the input tag
			inputElement.addEventListener("keypress", (event) => {
				if (event.key === "Enter") event.preventDefault();
			});
		});

		// clicks on people tab
		document.querySelector("#people-btn").addEventListener("click", async () => {
			if (peopleSection.classList.contains("hide")) {
				activitySection.classList.add("hide");
				messageSection.classList.add("hide");
				peopleSection.classList.remove("hide");

				document.querySelector(".pending .number").textContent = pendingCount;
				document.querySelector(".sent .number").textContent = sentCount;

				await injectRemove();
				await injectOntoPeopleTab(campaignName);
			}
			
			// clicks on btn to remove selected lead from campaign 
			let leads = document.querySelectorAll(".leads-scraped");
			let removeBtns = document.querySelectorAll(".remove-btn");
			for (let i = 0; i < removeBtns.length; i++) {
				removeBtns[i].addEventListener("click", async () => {
					let indexToDelete = i;

					await deleteLead(campaignName, indexToDelete);
					leads[i].remove();
				});
			}
		})

		// clicks on activity tab
		document.querySelector("#activity-btn").addEventListener("click", async () => {
			if (activitySection.classList.contains("hide")) {
				activitySection.classList.remove("hide");
				messageSection.classList.add("hide");
				peopleSection.classList.add("hide");

				await injectRemove();
				await injectOntoActivityTab(campaignName);
			}
		});

		// clicks on btn to start sending invites to leads
		document.querySelector("#start-invite-btn").addEventListener("click", async () => {
			startInviteFooter.classList.add("hide");
			stopInviteFooter.classList.remove("hide");

			console.log("sent request to content script to pause scraping");
			invitePort.postMessage({ action: "Start Sending Invites" });

			invitePort.onMessage.addListener(function(response) {
				if (response.message === "" ) {
					
				}
			});
		});

		// clicks on btn to stop sending invites to leads
		document.querySelector("#stop-invite-btn").addEventListener("click", async () => {
			startInviteFooter.classList.remove("hide");
			stopInviteFooter.classList.add("hide");

			console.log("sent request to content script to stop sending invites");
			invitePort.postMessage({ action: "Stop Sending Invites" });

			invitePort.onMessage.addListener(function(response) {
				if (response.message === "" ) {
					
				}
			});
		});

		// clicks on back btn to go back to home page
		document.querySelector(".back").addEventListener("click", () => {
			activitySection.classList.remove("hide");
			messageSection.classList.add("hide");
			peopleSection.classList.add("hide");

			//remove campaign's content from activity tab
			injectRemove(document.querySelectorAll(".leads-scraped"));

			window.location.href = "home.html";
		});

		// button is clicked to close the popup
		closeButtonActivity.addEventListener('click', function() {
			window.close();
		});
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
		leadInfo.classList.add("lead-info");
		// create name element and addding to leadInfo
		const leadName = document.createElement("div");
		leadName.classList.add("lead-name");
		leadName.innerText = data[i].fullName;
		leadName.setAttribute("href", data[i].profileLink);
		leadInfo.appendChild(leadName);
		// create jobTitle element and adding to leadInfo
		const leadJobTitle = document.createElement("div");
		leadJobTitle.classList.add("lead-title");
		leadJobTitle.innerText = data[i].jobTitle;
		leadInfo.appendChild(leadJobTitle);
		// appending leadInfo (leadName + leadJobTitle) to leadDiv
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
async function injectOntoHome() {
	const items = await new Promise(resolve => {
		chrome.storage.local.get(null, resolve);
	});
	
	const keys = Object.keys(items);

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

		// create cancel delete button and add it to campaignDiv
		const cancelDelete = document.createElement("div");
		cancelDelete.classList.add("cancel-delete-btn", "hide");
		const cancelDeleteImage = document.createElement("img");
		cancelDeleteImage.classList.add("cancel-delete-btn-img");
		cancelDeleteImage.setAttribute("src", "assets/Close button2.png");
		cancelDelete.appendChild(cancelDeleteImage);
		campaignDiv.appendChild(cancelDelete);
	
		// create delete button and add it to campaignDiv
		const deleteCampaign = document.createElement("div");
		deleteCampaign.classList.add("delete-campaign-btn");
		const deleteBtnImage = document.createElement("img");
		deleteBtnImage.classList.add("delete-campaign-btn-img");
		deleteBtnImage.setAttribute("src", "assets/delete.png");
		deleteCampaign.appendChild(deleteBtnImage);
		campaignDiv.appendChild(deleteCampaign);

		// create confirm delete button and add it to campaignDiv
		const confirmDelete = document.createElement("div");
		confirmDelete.classList.add("confirm-delete-btn", "hide");
		const confirmDeleteImage = document.createElement("img");
		confirmDeleteImage.classList.add("confirm-delete-btn-img");
		confirmDeleteImage.setAttribute("src", "assets/right-tick.jpg");
		confirmDelete.appendChild(confirmDeleteImage);
		campaignDiv.appendChild(confirmDelete);
	
		campaigns.appendChild(campaignDiv);
	}
	console.log("injected all created campaigns onto home.html");
} 


// function for injecting selected campaign's data onto activity tab of activity.html
async function injectOntoActivityTab(campaignName) {
	let data = await new Promise((resolve) => {
		chrome.storage.local.get([campaignName], (result) => {
			console.log(campaignName);
			resolve(result[campaignName].scrapedData);
		});
	});

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
		leadInfo.classList.add("lead-info");
		// create name element and addding to leadInfo
		const leadName = document.createElement("div");
		leadName.classList.add("lead-name");
		leadName.innerText = data[i].fullName;
		leadName.setAttribute("href", data[i].profileLink);
		leadInfo.appendChild(leadName);
		// create jobTitle element and adding to leadInfo
		const leadJobTitle = document.createElement("div");
		leadJobTitle.classList.add("lead-title");
		leadJobTitle.innerText = data[i].jobTitle;
		leadInfo.appendChild(leadJobTitle);
		// appending leadInfo (leadName + leadJobTitle) to leadDiv
		leadDiv.appendChild(leadInfo);


		// creating activity status element and adding to leadDiv
		const leadStatus = document.createElement("div");
		leadStatus.classList.add("lead-status");
		leadStatus.innerText = data[i].status;
		leadDiv.appendChild(leadStatus);

		leads.appendChild(leadDiv);
	}
}


// function for injecting selected campaign's name and mesg template onto msg tab of activity.html
async function injectOntoMessageTab(campaignName) {
	let message = await new Promise((resolve) => {
		chrome.storage.local.get([campaignName], (result) => {
			resolve(result[campaignName].messageTemplate);
		});
	});

	let messageTemplateDiv = document.querySelector(".message-template");
	messageTemplateDiv.querySelector("#campaign-name").value = campaignName;
	messageTemplateDiv.querySelector("#message-input").value = message;
}


// function for injecting selected campaign's data onto people tab of activity.html
async function injectOntoPeopleTab(campaignName) {
	let pendingCount = 0;
	let sentCount = 0;

	let data = await new Promise((resolve) => {
		chrome.storage.local.get([campaignName], (result) => {
			console.log(campaignName);
			for (i = 0; i < result[campaignName].scrapedData.length; i++) {
				if (result[campaignName].scrapedData[i].status == "pending") ++pendingCount;
				else ++sentCount;
			}
			document.querySelector(".pending .number").textContent = pendingCount;
			document.querySelector(".sent .number").textContent = sentCount;
			resolve(result[campaignName].scrapedData);
		});
	});

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
		leadInfo.classList.add("lead-info");
		// create name element and addding to leadInfo
		const leadName = document.createElement("div");
		leadName.classList.add("lead-name");
		leadName.innerText = data[i].fullName;
		leadName.setAttribute("href", data[i].profileLink);
		leadInfo.appendChild(leadName);
		// create jobTitle element and adding to leadInfo
		const leadJobTitle = document.createElement("div");
		leadJobTitle.classList.add("lead-title");
		leadJobTitle.innerText = data[i].jobTitle;
		leadInfo.appendChild(leadJobTitle);
		// appending leadInfo (leadName + leadJobTitle) to leadDiv
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
async function injectRemove() {
	let leadDiv = document.querySelectorAll(".leads-scraped");
	for (let i = 0; i < leadDiv.length; i++) {
		leadDiv[i].remove();
	}
}



//----------------------------------------------------------------------------------------------------



// function to store created campaign's data in local storage
async function storeCampaignData(scrapedData, campaignName, messageTemplate, date){
	// storing data in local storage
	chrome.storage.local.set({ [campaignName]: { scrapedData, messageTemplate, date } });
}


// function to delete selected campaign's data from local storage
async function deleteCampaignData(campaignName){
	// deleting data from local storage
	chrome.storage.local.remove(campaignName);
}


// function for updating the message template and/or campaign name of selected campaign
async function updateCampaignData(oldCampaignName, newCampaignName, newMessageTemplate) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(oldCampaignName, function(data) {
			const existingData = data[oldCampaignName];
			if (!existingData) {
				reject(`Data for campaign ${oldCampaignName} not found in storage`);
				return;
			}
	
			const newData = {
				scrapedData: existingData.scrapedData,
				messageTemplate: newMessageTemplate,
				date: existingData.date
			};
	
			chrome.storage.local.remove(oldCampaignName, function() {
				chrome.storage.local.set({ [newCampaignName]: newData }, function() {
					resolve(`Campaign data updated successfully. New campaign name: ${newCampaignName}`);
				});
			});
		});
	});
}

// function to delete a lead's data from local storage
async function deleteLead(campaignName, indexToDelete) {
	let pendingCount = document.querySelector(".pending .number").textContent;
	let sentCount = document.querySelector(".sent .number").textContent;
	let messageTemplate = "";
	let date = "";

	let data = await new Promise((resolve) => {
		chrome.storage.local.get([campaignName], (result) => {
			console.log(campaignName);
			messageTemplate = result[campaignName].messageTemplate;
			date = result[campaignName].date;
			if (pendingCount > 0) document.querySelector(".pending .number").textContent = --pendingCount;
			if (sentCount > 0) document.querySelector(".sent .number").textContent = --sentCount;
			resolve(result[campaignName].scrapedData);
		});
	});

	// Remove the item at selected index postion
	data.splice(indexToDelete, 1);

	// Update the campaign object in local storage with the modified scrapedData array
	return new Promise((resolve) => {
		chrome.storage.local.set({ 
			[campaignName]: { 
				scrapedData: data,
				messageTemplate: messageTemplate,
				date: date
			} 
		}, () => {resolve();}
		);
	});
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