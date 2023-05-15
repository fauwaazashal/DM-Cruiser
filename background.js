//-----------------------------------------------global variables----------------------------------------------------

const minDelay = 5000; // minimum delay in milliseconds
const maxDelay = 8000; // maximum delay in milliseconds
const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
let isStopped = false;
let campaignName = "";

//----------------------------------------------listening for requests----------------------------------------------------



// Stores pre-requisite data upon installation of extension
chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.local.get(function(data) {
		if (!data || !data.Campaigns) {
			chrome.storage.local.set({
				Campaigns: {},
				messageTemplates: {},
				lastVisitedState: {
					popupUrl: "home.html",
					campaignName: "",
					popupPageSection: "",
					scrapedData: []
				},
				dailyInviteQuota: 30
				}, function() {
				console.log("Data saved");
			});
		}
	});
});


// Resets the daily invite quota every 24 hours at exactly 12am local time
chrome.alarms.create('resetDailyInviteQuota', {
	periodInMinutes: 1440, // 24 hours in minutes
  	when: tomorrowAtMidnight()
});

function tomorrowAtMidnight() {
	const now = new Date();
	const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	return tomorrow.getTime();
}

chrome.alarms.onAlarm.addListener(async function(alarm) {
	if (alarm.name === 'resetDailyInviteQuota') {
		await chrome.storage.local.set({ dailyInviteQuota: 30 });;
	}
});


// Listens for when the extension icon in the toolbar is clicked
chrome.action.onClicked.addListener(function () {
	chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
		let currentTab = tabs[0];
		let currentUrl = currentTab.url;
		let popupUrl = "home.html";

		// if the URL includes LinkedIn then no need for a redirect
		if (currentUrl.includes("linkedin.com")) {
			await chrome.action.setPopup({ popup: popupUrl });
			console.log("No need for page redirect as we are already on LinkedIn");
		}

		// if the current URL is not LinkedIn, then create a new tab and enter the LinkedIn URL
		else {
			await chrome.tabs.create({ url: "https://www.linkedin.com/search/results/people" });
			await chrome.action.setPopup({ popup: popupUrl });
			console.log("Page redirected to LinkedIn");
		}
	});
});


// Listens for requests from the popup script
chrome.runtime.onConnect.addListener(function(port) {
	console.log("background port detected");

	// port for setting popup url to latest state
	if (port.name === "set popup") {
		port.onMessage.addListener(async function(request) {
			if (request.action === "set popup to last visited state") {
				await chrome.action.setPopup({ popup: request.url });
				port.postMessage({ message: "succesfully set popup to last visited state" });
			}
		});
	}

	// port for checking if the user is on linkedin or not at the time of clciking on the extension icon
	if (port.name === "linkedin url check") {
		port.onMessage.addListener(async function(request) {
			if (request.action === "is user on the linkedin") {
				chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
					let currentTab = tabs[0];
					let currentUrl = currentTab.url;
			
					// if the URL includes LinkedIn then no need for a redirect
					if (currentUrl.includes("linkedin.com")) {
						//await chrome.action.setPopup({ popup: request.url });
						console.log("No need for page redirect as we are already on LinkedIn");
					}
			
					// if the current URL is not LinkedIn, then create a new tab and enter the LinkedIn URL
					else {
						await chrome.tabs.create({ url: "https://www.linkedin.com/search/results/people" });
						//await chrome.action.setPopup({ popup: request.url });
						console.log("Page redirected to LinkedIn");
					}
				});
			}
		});
	}

	// port for checking if the user is on the right page before initiating scraping
	if (port.name === "pre scrape url check") {
		port.onMessage.addListener(async function(request) {
			if (request.action === "is user on the right page to scrape") {
				chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
					let currentTab = tabs[0];
					let currentUrl = currentTab.url;
					let targetUrl = "https://www.linkedin.com/search/results/people";
					
					if (!currentUrl.startsWith(targetUrl)) await navigate(targetUrl);
					port.postMessage({ message: "user is on the right page" });
				});
			} 
		});
		
	}

	// port for automating invites to leads
	if (port.name === "load leads profiles") {
		console.log("established connection with port to load users' profiles one by one");

		async function navigateAndSendInvites(campaignName, inviteeCount) {

			let dailyInviteQuotaStorage = await chrome.storage.local.get('dailyInviteQuota');
			let dailyInviteQuota = dailyInviteQuotaStorage.dailyInviteQuota;

			if (dailyInviteQuota !== 0 || inviteeCount !== 0) {
				while (!isStopped && inviteeCount !== 0) {
					let campaignData = await retrieveCampaignData(campaignName);
					let leadsData = campaignData.scrapedData;
					let messageTemplate = campaignData.messageTemplate;
					console.log(leadsData);
	
					let pendingCount = 0;
					for (let i = 0; i < leadsData.length; i++) {
						if (leadsData[i].status == "pending") ++pendingCount;
					}
	
					if (pendingCount != 0) {
						console.log(leadsData[0].profileLink);
						// loads leads's profile onto webpage
						await navigate(leadsData[0].profileLink);
						console.log("profile page loaded");
	
	
						if (!isStopped) {
							// calls function to send invite to lead
							await sendInvite(campaignName, leadsData[0], messageTemplate);
							console.log("sent invite to one lead");
							port.postMessage({ message: "invite sent and updated data in storage" });
							--inviteeCount; // decrement the invitee count set by the user after each invite is sent
						}
	
						else break;
					}
	
					else {
						isStopped = true;
						console.log("sent invites to all leads in campaign");
					}
					
				}
			}
			else {
				if (inviteeCount === 0) port.postMessage({ message: "completed user's invitee counter" });
				else port.postMessage({ message: "exhausted daily invite quota" });
			}
			
		}

		port.onMessage.addListener(async function(request) {
			if (request.action === "Start Sending Invites") {
				console.log("receieved request from popup to load users' profiles");
				campaignName = request.campaignName;
				let inviteeCount = request.inviteeCount;

				navigateAndSendInvites(campaignName, inviteeCount);
			}

			else if (request.action === "Stop Sending Invites") {
				console.log("receieved request from popup to stop sending invites");
				isStopped = true;
				port.postMessage({ message: "stopped sending invites" });
			}
		});
	}
});



//-----------------------------------------------functions ()----------------------------------------------------



// function to retrieve selected campaign's data
async function retrieveCampaignData(campaignName) {
	let campaignData = await new Promise((resolve) => {
			chrome.storage.local.get('Campaigns', (result) => {
				console.log(campaignName);
				resolve(result.Campaigns[campaignName]);
			});
		});

	return campaignData;
}


// function reload the web page with the lead's profile link
async function navigate(profileLink) {
	return new Promise(resolve => {
		chrome.tabs.update({ url: profileLink }, function(tab) {
			chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
				if (tabId === tab.id && changeInfo.status === "complete") {
				chrome.tabs.onUpdated.removeListener(listener);
				setTimeout(() => resolve(true), 3000);
				}
			});
		});
	});
}


// function to create port and send request to content script to send invite to lead
async function sendInvite(campaignName, leadData, messageTemplate) {
	return new Promise((resolve) => {
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			console.log(tabs);

			const invitePort = chrome.tabs.connect(tabs[0].id, { name: "send invites" });
			console.log("sent request from background script to content script to send invite to a lead")
			invitePort.postMessage({ 
				action: "Start Sending Invites", 
				leadData: leadData,
				messageTemplate: messageTemplate
			});

			invitePort.onMessage.addListener(async function(response) {
				if (response.message === "invite sent") {
					await updateDailyInviteQuota();
					await updateCampaignData(campaignName);
					resolve();
				}
			});
		});
	});
}


// function to update daily invite quota after sending every invite
async function updateDailyInviteQuota() {
	let dailyInviteQuotaStorage = await chrome.storage.local.get('dailyInviteQuota');
	let dailyInviteQuota = dailyInviteQuotaStorage.dailyInviteQuota;
	--dailyInviteQuota;
	dailyInviteQuotaStorage.dailyInviteQuota = dailyInviteQuota;

	await chrome.storage.local.set({ dailyInviteQuota: dailyInviteQuotaStorage.dailyInviteQuota });
}


// function for updating the message template and/or campaign name of selected campaign
async function updateCampaignData(campaignName) {
	let campaignStorage = await chrome.storage.local.get('Campaigns');

	let firstItem = campaignStorage.Campaigns[campaignName].scrapedData.shift();
	firstItem.status = "sent";
	campaignStorage.Campaigns[campaignName].scrapedData.push(firstItem);

	return new Promise((resolve) => {
		chrome.storage.local.set({ Campaigns: campaignStorage.Campaigns }, () => {resolve();});
	});
}




// Saves the last visited popup's data when the popup is closed
// chrome.windows.onRemoved.addListener(function(windowId) {
//   // Check if the closed window was the popup window
//   chrome.windows.getLastFocused({populate: true}, function (window) {
//     let popupUrl = chrome.action.getPopup({}).url;
//     if (windowId === window.id && popupUrl) {
//       let currentUrl = window.tabs[0].url;
//       chrome.storage.local.set({ lastVisitedPopup: { url: popupUrl, data: { url: currentUrl } } });
//     }
//   });
// });



// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.requestType === "Check URL") {
//     console.log("received request from popup script to check if we are on the right linkedin url before scraping");
    
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       let currentTab = tabs[0];
//       let currentUrl = currentTab.url;
//       let targetURL = currentUrl + "&%5B%22O%22%2C%22S%22%5D";
  
//       // if the URL includes the encoding for the 2nd & 3rd degree connections then no need for a reload
//       if (currentUrl.includes("%5B%22O%22%2C%22S%22%5D")) {
//         sendResponse({ message: "No need for page reload" });
//         console.log("No need for page reload");
//       }

//       // if the current URL doesn't include the encoding for the 2nd & 3rd degree connections then reload with updated URL
//       else {
//         chrome.tabs.update(tabs[0].id, { url: targetURL}); 
//         sendResponse({ message: "Page reloaded to targetURL" });
//         console.log("Page reloaded to targetURL");
//       }
//     });
//   }
// });

