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
let activityStatus = "";
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
				if (response.message === "Scraped one page") {
					console.log(response.data);
					
					// length of the data scraped thus far
					prevIterationData = scrapedData.length;
					// storing all scraped data in this variable
					scrapedData = response.data; 
					// obtaining the length of the data (from reverse) that is to be injected
					injectDataLength = scrapedData.length - prevIterationData;
					// updating the data that needs to be injected in this iteration
					if (injectDataLength != 0) {
						injectData = scrapedData.slice(-injectDataLength);
						console.log(injectData);
						// inject response.data onto popup
						await injectOntoNewsearch(injectData);
					}
					
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

			const textbox = document.getElementById('campaign-name');
			const errorMessage = document.getElementById('error-message');
			const saveBtn = document.getElementById('save-campaign');
			errorMessage.style.display = 'none';   // Hide the message
			textbox.style.borderColor = '';     // Reset the border color
			saveBtn.disabled = false;        // Enable the Save button

			scrapePort.onMessage.addListener(async function(response) {
				if (response.message === "Stopped Scraping") {
					let campaignStorage = await chrome.storage.local.get('Campaigns');
					let campaignKeys = Object.keys(campaignStorage["Campaigns"]);
					let campaignCount = campaignKeys.length;
					newmessageTemplateDiv.querySelector("#campaign-name").value = `Campaign ${campaignCount + 1}`;
					newmessageTemplateDiv.querySelector("#message-input").value = "Hey {first_name}, \nI hope this message finds you well. We just recently finished developing a website for one of your competitors Archf.in, are you looking to upgrade your website?. If so, I'd love to understand your business and help.\n\nBest Regards \n{my_name} \nskitmedia.in";
					updateCharacterCount();					  
				}
			});
		})

		// Campaign Name Error Message
		const textbox = document.getElementById('campaign-name');
		const errorMessage = document.getElementById('error-message');
		const saveBtn = document.getElementById('save-campaign');

		textbox.addEventListener('input', function() {
			if (textbox.value === '') {
				errorMessage.style.display = 'block';  // Show the message
				textbox.style.borderColor = 'red'; // Change the border color to red
				saveBtn.disabled = true; // Disable the Save button
			} else {
				errorMessage.style.display = 'none';   // Hide the message
				textbox.style.borderColor = '';     // Reset the border color
				saveBtn.disabled = false;        // Enable the Save button
			}
			async function campAllName(){
				let campaignStorage = await chrome.storage.local.get("Campaigns");
				let data = campaignStorage.Campaigns;
				let campaignKeys = Object.keys(data);
				for (let index = 0; index < campaignKeys.length; index++) {
					if (textbox.value === campaignKeys[index]) {
						errorMessage.style.display = 'block';  // Show the message
						textbox.style.borderColor = 'red'; // Change the border color to red
						saveBtn.disabled = true; // Disable the Save button
					}
				}
			}
			campAllName();
		});

		// placeholder buttons functionality
		//first name
		document.querySelector("#firstName").addEventListener("click", () => {
			var textarea = document.getElementById("message-input");
			var textToAdd = "{first_name}";
			var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
			// Check if there is enough space for the full string
			if (remainingSpace >= textToAdd.length) {
				// Get the current cursor position
				var startPos = textarea.selectionStart;
				var endPos = textarea.selectionEnd;
				// Insert the text at the cursor position
				textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
				// Move the cursor to the end of the inserted text
				textarea.selectionStart = startPos + textToAdd.length;
				textarea.selectionEnd = startPos + textToAdd.length;
				// Scroll to the position of the cursor
				var cursorPos = textarea.selectionStart;
				var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
				var linesAbove = Math.floor(cursorPos / textarea.cols);
				textarea.scrollTop = lineHeight * linesAbove;
				// Set focus on the textarea
				textarea.focus();
			}
			updateCharacterCount();
		});

		//last name
		document.querySelector("#lastName").addEventListener("click", () => {
			var textarea = document.getElementById("message-input");
			var textToAdd = "{last_name}";
			var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
			// Check if there is enough space for the full string
			if (remainingSpace >= textToAdd.length) {
				// Get the current cursor position
				var startPos = textarea.selectionStart;
				var endPos = textarea.selectionEnd;
				// Insert the text at the cursor position
				textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
				// Move the cursor to the end of the inserted text
				textarea.selectionStart = startPos + textToAdd.length;
				textarea.selectionEnd = startPos + textToAdd.length;
				// Scroll to the position of the cursor
				var cursorPos = textarea.selectionStart;
				var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
				var linesAbove = Math.floor(cursorPos / textarea.cols);
				textarea.scrollTop = lineHeight * linesAbove;
				// Set focus on the textarea
				textarea.focus();
			}
			updateCharacterCount();
		});

		//full name
		document.querySelector("#fullName").addEventListener("click", () => {
			var textarea = document.getElementById("message-input");
			var textToAdd = "{full_name}";
			var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
			// Check if there is enough space for the full string
			if (remainingSpace >= textToAdd.length) {
				// Get the current cursor position
				var startPos = textarea.selectionStart;
				var endPos = textarea.selectionEnd;
				// Insert the text at the cursor position
				textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
				// Move the cursor to the end of the inserted text
				textarea.selectionStart = startPos + textToAdd.length;
				textarea.selectionEnd = startPos + textToAdd.length;
				// Scroll to the position of the cursor
				var cursorPos = textarea.selectionStart;
				var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
				var linesAbove = Math.floor(cursorPos / textarea.cols);
				textarea.scrollTop = lineHeight * linesAbove;
				// Set focus on the textarea
				textarea.focus();
			}
			updateCharacterCount();
		});

		//job title
		document.querySelector("#jobTitle").addEventListener("click", () => {
			var textarea = document.getElementById("message-input");
			var textToAdd = "{job_title}";
			var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
			// Check if there is enough space for the full string
			if (remainingSpace >= textToAdd.length) {
				// Get the current cursor position
				var startPos = textarea.selectionStart;
				var endPos = textarea.selectionEnd;
				// Insert the text at the cursor position
				textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
				// Move the cursor to the end of the inserted text
				textarea.selectionStart = startPos + textToAdd.length;
				textarea.selectionEnd = startPos + textToAdd.length;
				// Scroll to the position of the cursor
				var cursorPos = textarea.selectionStart;
				var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
				var linesAbove = Math.floor(cursorPos / textarea.cols);
				textarea.scrollTop = lineHeight * linesAbove;
				// Set focus on the textarea
				textarea.focus();
			}
			updateCharacterCount();
		});

		var textarea = document.getElementById("message-input");
		var charCount = document.getElementById("charCount");
		function updateCharacterCount() {
			var count = textarea.value.length;
			// Display the character count
			charCount.textContent = count + "/275";
			// Limit the input to 275 characters
			if (count >= 275) {
				textarea.value = textarea.value.slice(0, 275);
				count = 275;
				charCount.textContent = count + "/275";
			}
		};

		// Call the function initially to display the character count
		// updateCharacterCount();

		// Update the character count whenever there is an input event
		textarea.addEventListener("input", updateCharacterCount);

		// button is clicked to pause scraping
		document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.add("hide");
			resumeScrapeFooter.classList.remove("hide");
			loadingContainer.classList.add("hide");
			
			console.log("sent request to content script to pause scraping");
			scrapePort.postMessage({ action: "Pause Scraping" });

			scrapePort.onMessage.addListener(function(response) {
				if (response.message === "Paused Scraping") {
					
				}
			});
			// button is clicked to remove any selected leads before saving the campaign
			document.querySelector(".remove-btn").addEventListener("click", () => {
				let leads = document.querySelectorAll(".leads-scraped");
				let removeBtns = document.querySelectorAll(".remove-btn");
				for (let i = 0; i < removeBtns.length; i++) {
					removeBtns[i].addEventListener("click", async () => {
						scrapedData.splice(i, 1);
						leads[i].remove();
					});
				}
			})
		})
	
		// button is clicked to resume scraping
		document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
			pauseScrapeFooter.classList.remove("hide");
			resumeScrapeFooter.classList.add("hide");
			loadingContainer.classList.remove("hide");
			
			scrapePort.postMessage({ action: "Resume Scraping" });

			scrapePort.onMessage.addListener(function(response) {
				if (response.message === "Resumed Scraping") {
					
				}
			});
		})

		// handling click of enter key inside the input tag
		inputElement.addEventListener("keypress", (event) => {
			if (event.key === "Enter") event.preventDefault();
		});

		// button is clicked to complete campaign creation and store data in local storage
		document.querySelector("#save-campaign").addEventListener("click", async () => {
			campaignName = newmessageTemplateDiv.querySelector("#campaign-name").value;
			messageTemplate = newmessageTemplateDiv.querySelector("#message-input").value;
			date = new Date().toLocaleDateString("en-IN");

			await storeCampaignData(campaignName, scrapedData, messageTemplate, date);

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

			// button is clicked to remove any selected leads before saving the campaign
			document.querySelector(".remove-btn").addEventListener("click", () => {
				let leads = document.querySelectorAll(".leads-scraped");
				let removeBtns = document.querySelectorAll(".remove-btn");
				for (let i = 0; i < removeBtns.length; i++) {
					removeBtns[i].addEventListener("click", async () => {
						scrapedData.splice(i, 1);
						leads[i].remove();
					});
				}
			})
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
		let campaignDivs = document.querySelectorAll(".campaign-box");
		for (let i = 0; i < campaignDivs.length; i++) {
			campaignDivs[i].addEventListener("click", (event) => {
				// Check if the delete button was clicked
				if (!event.target.classList.contains("delete-campaign-btn")) {
				campaignName = campaignDivs[i].querySelector(".campaign-name").innerText;
				// store campaignName in session storage so that it accessible even on activity.html
				sessionStorage.setItem("campaignName", campaignName);
				window.location.href = "activity.html";
				}
			});

			// storing refernces of the delete btn, cancel delete btn and confirm delete btn
			let deleteCampaignBtn = campaignDivs[i].querySelector(".delete-campaign-btn");
			let confirmDeleteBtn = campaignDivs[i].querySelector(".confirm-delete-btn");
			let cancelDeleteBtn = campaignDivs[i].querySelector(".cancel-delete-btn");

			// Add click event listener to the delete button
			campaignDivs[i].querySelector(".delete-campaign-btn").addEventListener("click", async (event) => {
				// Stop the event propagation to prevent the parent div's click event from being triggered
				event.stopPropagation();
				
				deleteCampaignBtn.classList.add("hide");
				confirmDeleteBtn.classList.remove("hide");
				cancelDeleteBtn.classList.remove("hide");				
			});

			// btn is clicked to confirm the deleting of the campaign
			campaignDivs[i].querySelector(".confirm-delete-btn").addEventListener("click", async (event) => {
				// Stop the event propagation to prevent the parent div's click event from being triggered
				event.stopPropagation();

				campaignName = campaignDivs[i].querySelector(".campaign-name").innerText;
				// call function to delete selected campaign
				await deleteCampaignData(campaignName);
				// Delete the parent div
				campaignDivs[i].remove();
			});
			
			// btn is clicked to cancel the deleting of the campaign
			campaignDivs[i].querySelector(".cancel-delete-btn").addEventListener("click", async (event) => {
				// Stop the event propagation to prevent the parent div's click event from being triggered
				event.stopPropagation();
				
				deleteCampaignBtn.classList.remove("hide");
				confirmDeleteBtn.classList.add("hide");
				cancelDeleteBtn.classList.add("hide");
			});
		}
	})();

	// clicks on create campaign btn
	document.querySelector("#create-campaign").addEventListener("click", () => {
		const preScrapePort = chrome.runtime.connect({ name: "pre scrape url check" });

		preScrapePort.postMessage({ action: "is user on the right page to scrape" });
		preScrapePort.onMessage.addListener( async function(response) {
			if (response.message === "user is on the right page") {
				window.location.href = "newsearch.html";
			}
		});
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

	(async () => {

		const activitySection = document.querySelector(".activity-section");
		const messageSection = document.querySelector(".message-section");
		const peopleSection = document.querySelector(".people-section");
		const startInviteFooter = document.querySelector(".start-invite-activity-footer");
		const stopInviteFooter = document.querySelector(".stop-invite-activity-footer");
		const inputElement = document.querySelector("#campaign-name");
		const startScrapeFooter = document.querySelector(".start-search-footer");
		const stopScrapeFooter = document.querySelector(".stop-search-footer");
		const pauseScrapeFooter = document.querySelector(".pause-search");
		const resumeScrapeFooter = document.querySelector(".resume-search");
		const loadingContainer = document.querySelector(".loading-container");
		const newsearchDiv = document.querySelector(".newsearch-popup");
		const activityPopup = document.querySelector(".activity-popup");
		const closeButtonActivity = document.querySelector(".close-btn");

		// retrieve campaignName from session storage
		campaignName = sessionStorage.getItem("campaignName");
		document.querySelector("#heading-activity").innerText = campaignName;
		pendingCount = 0;
		sentCount = 0;

		const loadUrlPort = chrome.runtime.connect({ name: "load leads profiles" });
		console.log("created port between popup & background scripts to load leads' profiles in order to send invites");

		await injectOntoActivityTab(campaignName);

		// message tab section
		
		// clicks on message tab
		document.querySelector("#message-btn").addEventListener("click", async () => {
			if (messageSection.classList.contains("hide")) {
				activitySection.classList.add("hide");
				messageSection.classList.remove("hide");
				peopleSection.classList.add("hide");

				//await injectRemove();
				await injectOntoMessageTab(campaignName);
				// updateCharacterCount();
			}

			// Campaign Name Error Message
			const textbox = document.getElementById('campaign-name');
			const errorMessage = document.getElementById('error-message');
			const saveBtn = document.getElementById('save-update-msg-campname-btn');
			const existingName = textbox.value;
			// errorMessage.style.display = 'none';   // Hide the message
			// textbox.style.borderColor = '';     // Reset the border color
			// saveBtn.disabled = false;        // Enable the Save button
			textbox.addEventListener('input', function() {
				if (textbox.value === '') {
					errorMessage.style.display = 'block';  // Show the message
					textbox.style.borderColor = 'red'; // Change the border color to red
					saveBtn.disabled = true; // Disable the Save button
				} else {
					errorMessage.style.display = 'none';   // Hide the message
					textbox.style.borderColor = '';     // Reset the border color
					saveBtn.disabled = false;        // Enable the Save button
				}
				async function campAllName(){
					let campaignStorage = await chrome.storage.local.get("Campaigns");
					let data = campaignStorage.Campaigns;
					let campaignKeys = Object.keys(data);
					for (let index = 0; index < campaignKeys.length; index++) {
						if (textbox.value === campaignKeys[index] && existingName !== textbox.value) {
							errorMessage.style.display = 'block';  // Show the message
							textbox.style.borderColor = 'red'; // Change the border color to red
							saveBtn.disabled = true; // Disable the Save button
						}
					}
				}
				campAllName();
			});

			// placeholder buttons functionality
			//first name
			document.querySelector("#firstName").addEventListener("click", () => {
				var textarea = document.getElementById("message-input");
				var textToAdd = "{first_name}";
				var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
				// Check if there is enough space for the full string
				if (remainingSpace >= textToAdd.length) {
					// Get the current cursor position
					var startPos = textarea.selectionStart;
					var endPos = textarea.selectionEnd;
					// Insert the text at the cursor position
					textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
					// Move the cursor to the end of the inserted text
					textarea.selectionStart = startPos + textToAdd.length;
					textarea.selectionEnd = startPos + textToAdd.length;
					// Scroll to the position of the cursor
					var cursorPos = textarea.selectionStart;
					var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
					var linesAbove = Math.floor(cursorPos / textarea.cols);
					textarea.scrollTop = lineHeight * linesAbove;
					// Set focus on the textarea
					textarea.focus();
				}
				updateCharacterCount();
			});

			//last name
			document.querySelector("#lastName").addEventListener("click", () => {
				var textarea = document.getElementById("message-input");
				var textToAdd = "{last_name}";
				var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
				// Check if there is enough space for the full string
				if (remainingSpace >= textToAdd.length) {
					// Get the current cursor position
					var startPos = textarea.selectionStart;
					var endPos = textarea.selectionEnd;
					// Insert the text at the cursor position
					textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
					// Move the cursor to the end of the inserted text
					textarea.selectionStart = startPos + textToAdd.length;
					textarea.selectionEnd = startPos + textToAdd.length;
					// Scroll to the position of the cursor
					var cursorPos = textarea.selectionStart;
					var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
					var linesAbove = Math.floor(cursorPos / textarea.cols);
					textarea.scrollTop = lineHeight * linesAbove;
					// Set focus on the textarea
					textarea.focus();
				}
				updateCharacterCount();
			});

			//full name
			document.querySelector("#fullName").addEventListener("click", () => {
				var textarea = document.getElementById("message-input");
				var textToAdd = "{full_name}";
				var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
				// Check if there is enough space for the full string
				if (remainingSpace >= textToAdd.length) {
					// Get the current cursor position
					var startPos = textarea.selectionStart;
					var endPos = textarea.selectionEnd;
					// Insert the text at the cursor position
					textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
					// Move the cursor to the end of the inserted text
					textarea.selectionStart = startPos + textToAdd.length;
					textarea.selectionEnd = startPos + textToAdd.length;
					// Scroll to the position of the cursor
					var cursorPos = textarea.selectionStart;
					var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
					var linesAbove = Math.floor(cursorPos / textarea.cols);
					textarea.scrollTop = lineHeight * linesAbove;
					// Set focus on the textarea
					textarea.focus();
				}
				updateCharacterCount();
			});

			//job title
			document.querySelector("#jobTitle").addEventListener("click", () => {
				var textarea = document.getElementById("message-input");
				var textToAdd = "{job_title}";
				var remainingSpace = 275 - textarea.value.length; // Calculate remaining space in the textarea
				// Check if there is enough space for the full string
				if (remainingSpace >= textToAdd.length) {
					// Get the current cursor position
					var startPos = textarea.selectionStart;
					var endPos = textarea.selectionEnd;
					// Insert the text at the cursor position
					textarea.value = textarea.value.substring(0, startPos) + textToAdd + textarea.value.substring(endPos, textarea.value.length);
					// Move the cursor to the end of the inserted text
					textarea.selectionStart = startPos + textToAdd.length;
					textarea.selectionEnd = startPos + textToAdd.length;
					// Scroll to the position of the cursor
					var cursorPos = textarea.selectionStart;
					var lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
					var linesAbove = Math.floor(cursorPos / textarea.cols);
					textarea.scrollTop = lineHeight * linesAbove;
					// Set focus on the textarea
					textarea.focus();
				}
				updateCharacterCount();
			});

			var textarea = document.getElementById("message-input");
			var charCount = document.getElementById("charCountMessage");
			function updateCharacterCount() {
				var count = textarea.value.length;
				// Display the character count
				charCount.textContent = count + "/275";
				// Limit the input to 275 characters
				if (count >= 275) {
					textarea.value = textarea.value.slice(0, 275);
					count = 275;
					charCount.textContent = count + "/275";
				}
			};

			// Call the function initially to display the character count
			updateCharacterCount();

			// Update the character count whenever there is an input event
			textarea.addEventListener("input", updateCharacterCount);

			

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

		// people tab section

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
					let leadName = leads[i].querySelector(".lead-name").innerText;

					await deleteLead(campaignName, leadName);
					leads[i].remove();
				});
			}
		})

		// clicks on add more people btn to add/scrape more lead to the existing campaign
		document.querySelector("#add-people").addEventListener("click", async () => {
			await injectRemove();
			activityPopup.classList.add("hide");
			newsearchDiv.classList.remove("hide");

			const preScrapePort = chrome.runtime.connect({ name: "pre scrape url check" });

			preScrapePort.postMessage({ action: "is user on the right page to scrape" });
			preScrapePort.onMessage.addListener( async function(response) {
				// if (response.message === "user is on the right page") {
					
				// }
			});
		})

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
					if (response.message === "Scraped one page") {
						console.log(response.data);
						
						// length of the data scraped thus far
						prevIterationData = scrapedData.length;
						// storing all scraped data in this variable
						scrapedData = response.data; 
						// obtaining the length of the data (from reverse) that is to be injected
						injectDataLength = scrapedData.length - prevIterationData;
						// updating the data that needs to be injected in this iteration
						if (injectDataLength != 0) {
							injectData = scrapedData.slice(-injectDataLength);
							console.log(injectData);
							// inject response.data onto popup
							await injectOntoNewsearch(injectData);
						}
						
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

			// button is clicked to pause scraping
			document.querySelector("#pause-scrape-btn").addEventListener("click", () => {
				pauseScrapeFooter.classList.add("hide");
				resumeScrapeFooter.classList.remove("hide");
				loadingContainer.classList.add("hide");
				
				console.log("sent request to content script to pause scraping");
				scrapePort.postMessage({ action: "Pause Scraping" });

				scrapePort.onMessage.addListener(function(response) {
					if (response.message === "Paused Scraping") {
						
					}
				});

				// button is clicked to remove any selected leads before saving the campaign
				document.querySelector(".remove-btn").addEventListener("click", () => {
					let leads = document.querySelectorAll(".leads-scraped");
					let removeBtns = document.querySelectorAll(".remove-btn");
					for (let i = 0; i < removeBtns.length; i++) {
						removeBtns[i].addEventListener("click", async () => {
							scrapedData.splice(i, 1);
							leads[i].remove();
						});
					}
				})
			})
		
			// button is clicked to resume scraping
			document.querySelector("#resume-scrape-btn").addEventListener("click", () => {
				pauseScrapeFooter.classList.remove("hide");
				resumeScrapeFooter.classList.add("hide");
				loadingContainer.classList.remove("hide");
				
				scrapePort.postMessage({ action: "Resume Scraping" });

				scrapePort.onMessage.addListener(function(response) {
					if (response.message === "Resumed Scraping") {
						
					}
				});
			})

			// button is clicked to stop scraping and now user has to create messsage template & campaign name
			document.querySelector("#stop-search-btn").addEventListener("click", () => {
				pauseScrapeFooter.classList.add("hide");
				resumeScrapeFooter.classList.add("hide");
				startScrapeFooter.classList.remove("hide");
				stopScrapeFooter.classList.add("hide");
				loadingContainer.classList.add("hide");
				newsearchDiv.classList.add("hide");
				activityPopup.classList.remove("hide");
				document.querySelector(".collected h6").innerText = "Collected: 0";
				injectRemove();
		
				console.log("sent request to content script to stop scraping");
				scrapePort.postMessage({ action: "Stop Scraping" });

				scrapePort.onMessage.addListener(async function(response) {
					if (response.message === "Stopped Scraping") {
						await addLeadsToCampaignData(campaignName, scrapedData);
						await injectOntoPeopleTab(campaignName);
						// scrapePort.disconnect();
						// console.log("disconnected port connection");
					}
				});
			})
		});


		// activity tab section

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

			console.log("sent request to background script to load leads' profiles");
			loadUrlPort.postMessage({ 
				action: "Start Sending Invites", 
				campaignName: campaignName
			});

			loadUrlPort.onMessage.addListener(async function(response) {
				if (response.message === "invite sent and updated data in storage") {
					let leads = document.querySelectorAll(".leads-scraped");
					leads[0].remove();
					await injectLeadAtBottom(campaignName);
				}
			});
		});

		// clicks on btn to stop sending invites to leads
		document.querySelector("#stop-invite-btn").addEventListener("click", async () => {
			startInviteFooter.classList.remove("hide");
			stopInviteFooter.classList.add("hide");

			console.log("sent request to content script to stop sending invites");
			loadUrlPort.postMessage({ action: "Stop Sending Invites" });

			loadUrlPort.onMessage.addListener(function(response) {
				if (response.message === "stopped sending invites") {
					console.log(response.message);
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
	})();
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
	let campaignStorage = await chrome.storage.local.get('Campaigns');
	let campaignKeys = Object.keys(campaignStorage["Campaigns"]);


	const campaignsSection = document.querySelector(".campaigns-section");

	for (let i = 0; i < campaignKeys.length; i++) {
		let scrapedData = campaignStorage.Campaigns[campaignKeys[i]].scrapedData;
		let date = campaignStorage.Campaigns[campaignKeys[i]].date;
		let sentCount = 0;

		for (let i = 0; i < scrapedData.length; i++) {
			if (scrapedData[i].status === "sent") ++sentCount;
		}
	
		// create new div element for newly created campaign
		const campaignDiv = document.createElement("div");
		campaignDiv.classList.add("campaign-box");
	
		// create campaign info (name + status) element and add to campaignDiv
		const campaignInfo = document.createElement("div");
		campaignInfo.classList.add("campaign-info");
		// create campaign name element and add to campaignInfo
		const campName = document.createElement("div");
		campName.classList.add("campaign-name");
		campName.innerText = campaignKeys[i];
		campaignInfo.appendChild(campName);
		// create activity status element and add to campaignInfo
		const campaignStatus = document.createElement("div");
		campaignStatus.classList.add("activity-status");
		campaignStatus.innerText = `${sentCount} of ${scrapedData.length} sent`;
		campaignInfo.appendChild(campaignStatus);
		// appending campaign info (name + status) to campaignDiv
		campaignDiv.appendChild(campaignInfo);
	
		// create date element and add it to campaignDiv
		const campaignDate = document.createElement("div");
		campaignDate.classList.add("date");
		campaignDate.innerText = date;
		campaignDiv.appendChild(campaignDate);

		// create cancel delete button and add it to campaignDiv
		const cancelDelete = document.createElement("div");
		cancelDelete.classList.add("cancel-delete-btn", "hide");
		const cancelDeleteImage = document.createElement("img");
		cancelDeleteImage.classList.add("cancel-delete-btn-img");
		cancelDeleteImage.setAttribute("src", "assets/Close-icon.png");
		cancelDelete.appendChild(cancelDeleteImage);
		campaignDiv.appendChild(cancelDelete);
	
		// create delete button and add it to campaignDiv
		const deleteCampaign = document.createElement("div");
		deleteCampaign.classList.add("delete-campaign-btn");
		const deleteBtnImage = document.createElement("img");
		deleteBtnImage.classList.add("delete-campaign-btn-img");
		deleteBtnImage.setAttribute("src", "assets/delete-icon.png");
		deleteCampaign.appendChild(deleteBtnImage);
		campaignDiv.appendChild(deleteCampaign);

		// create confirm delete button and add it to campaignDiv
		const confirmDelete = document.createElement("div");
		confirmDelete.classList.add("confirm-delete-btn", "hide");
		const confirmDeleteImage = document.createElement("img");
		confirmDeleteImage.classList.add("confirm-delete-btn-img");
		confirmDeleteImage.setAttribute("src", "assets/right-tick-icon.png");
		confirmDelete.appendChild(confirmDeleteImage);
		campaignDiv.appendChild(confirmDelete);
	
		campaignsSection.appendChild(campaignDiv);
	}
	console.log("injected all created campaigns onto home.html");
} 


// function for injecting selected campaign's data onto activity tab of activity.html
async function injectOntoActivityTab(campaignName) {
	let campaignStorage = await chrome.storage.local.get("Campaigns");
	let data = campaignStorage.Campaigns[campaignName].scrapedData;

	// let campaignData = await chrome.storage.local.get(campaignName);
	// let data = campaignData[campaignName].scrapedData;

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
	let campaignStorage = await chrome.storage.local.get("Campaigns");
	let message = campaignStorage.Campaigns[campaignName].messageTemplate;

	let messageTemplateDiv = document.querySelector(".message-template");
	messageTemplateDiv.querySelector("#campaign-name").value = campaignName;
	messageTemplateDiv.querySelector("#message-input").value = message;
}


// function for injecting selected campaign's data onto people tab of activity.html
async function injectOntoPeopleTab(campaignName) {
	let pendingCount = 0;
	let sentCount = 0;

	let campaignStorage = await chrome.storage.local.get("Campaigns");
	let data = campaignStorage["Campaigns"][campaignName].scrapedData;

	for (i = 0; i < data.length; i++) {
		if (data[i].status == "pending") ++pendingCount;
		else ++sentCount;
	}
	document.querySelector(".pending .number").textContent = pendingCount;
	document.querySelector(".sent .number").textContent = sentCount;

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


// function to inject lead at the bottom of the leads-section
async function injectLeadAtBottom(campaignName) {
	let campaignStorage = await chrome.storage.local.get("Campaigns");
	let data = campaignStorage.Campaigns[campaignName].scrapedData;

	let lastPos = data.length - 1 ;

	let leads = document.querySelector(".activity-leads-section");

	// create new div element for lead
	const leadDiv = document.createElement("div");
	leadDiv.classList.add("leads-scraped");

	// create image element and adding to leadDiv
	const leadImage = document.createElement("div");
	const image = document.createElement("img");
	image.classList.add("lead-image");
	if (data[lastPos].image == "") image.setAttribute("src", "assets/defaultprofile100.png");
	else image.setAttribute("src", data[lastPos].image);
	image.setAttribute("alt", data[lastPos].fullName);
	leadImage.appendChild(image);
	leadDiv.appendChild(leadImage);


	// create info element and adding to leadDiv
	const leadInfo = document.createElement("div");
	leadInfo.classList.add("lead-info");
	// create name element and addding to leadInfo
	const leadName = document.createElement("div");
	leadName.classList.add("lead-name");
	leadName.innerText = data[lastPos].fullName;
	leadName.setAttribute("href", data[lastPos].profileLink);
	leadInfo.appendChild(leadName);
	// create jobTitle element and adding to leadInfo
	const leadJobTitle = document.createElement("div");
	leadJobTitle.classList.add("lead-title");
	leadJobTitle.innerText = data[lastPos].jobTitle;
	leadInfo.appendChild(leadJobTitle);
	// appending leadInfo (leadName + leadJobTitle) to leadDiv
	leadDiv.appendChild(leadInfo);


	// creating activity status element and adding to leadDiv
	const leadStatus = document.createElement("div");
	leadStatus.classList.add("lead-status");
	leadStatus.innerText = data[lastPos].status;
	leadDiv.appendChild(leadStatus);

	leads.appendChild(leadDiv);
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
async function storeCampaignData(campaignName, scrapedData, messageTemplate, date){
	// Define the data for the new campaign
	let newCampaignData = {
		scrapedData: scrapedData,
		messageTemplate: messageTemplate,
		date: date
	};

	let campaignStorage = await chrome.storage.local.get('Campaigns');
	campaignStorage.Campaigns[campaignName]= newCampaignData;
	await chrome.storage.local.set({ Campaigns: campaignStorage.Campaigns });
}


// function to add more leads to the storage of an existing campaign\
async function addLeadsToCampaignData(campaignName, newData) {
	let campaignStorage = await chrome.storage.local.get('Campaigns');
	let existingData = campaignStorage.Campaigns[campaignName].scrapedData;
	campaignStorage.Campaigns[campaignName].scrapedData = [...existingData, ...newData];
	
	await chrome.storage.local.set({ Campaigns: campaignStorage.Campaigns });
}


// function to delete selected campaign's data from local storage
async function deleteCampaignData(campaignName){
	let campaignStorage = await chrome.storage.local.get('Campaigns');
	delete campaignStorage.Campaigns[campaignName];
	await chrome.storage.local.set({ Campaigns: campaignStorage.Campaigns });
}


// function for updating the message template and/or campaign name of selected campaign
async function updateCampaignData(oldCampaignName, newCampaignName, newMessageTemplate) {
	let campaignStorage = await chrome.storage.local.get('Campaigns');
	let existingData = campaignStorage.Campaigns[oldCampaignName];

	let updatedCampaignData = {
		scrapedData: existingData.scrapedData,
		messageTemplate: newMessageTemplate,
		date: existingData.date
	};

	delete campaignStorage.Campaigns[oldCampaignName];
	campaignStorage.Campaigns[newCampaignName] = updatedCampaignData;
	await chrome.storage.local.set({Campaigns: campaignStorage.Campaigns});
}

// function to delete a lead's data from local storage
async function deleteLead(campaignName, leadName) {
	let pendingCount = document.querySelector(".pending .number").textContent;
	let sentCount = document.querySelector(".sent .number").textContent;

	let campaignStorage = await chrome.storage.local.get('Campaigns');
	let data = campaignStorage.Campaigns[campaignName].scrapedData;

	for (let i = 0; i < data.length; i++) {
		if (data[i].fullName == leadName) {
			if (data[i].status === "pending") 
			document.querySelector(".pending .number").textContent = --pendingCount;
		else 
			document.querySelector(".sent .number").textContent = --sentCount;

		// Remove the item at selected index postion
		data.splice(i, 1);
		}
	}

	// Save the updated data back to local storage
	await chrome.storage.local.set({ Campaigns: campaignStorage.Campaigns });
}


// function to retriev campaign data
async function retrieveCampaignData() {
	campaignStorage = await chrome.storage.local.get('Campaigns');
	return campaignStorage.Campaigns;
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