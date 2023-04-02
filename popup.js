/*
document.addEventListener('DOMContentLoaded', function() {
	var closeButton = document.getElementById('close-popup');

	closeButton.addEventListener('click', function() {
		window.close();
	});
});


document.addEventListener('DOMContentLoaded', function() {
	var endButton = document.getElementById('.close-btn');

	endButton.addEventListener('click', function() {
		window.close();
	});
});
*/

const openButton = document.querySelector('.start');

openButton.addEventListener('click', function() {
  console.log('clicked');
	//window.location.href = 'home.html';
});

const button = document.querySelector('#create-campaign');

button.addEventListener('click', function() {
	console.log('clicked');
	//window.location.href = 'camp.html';
});

const closeButton = document.querySelector('.close-btn');

closeButton.addEventListener('click', function() {
	console.log('clicked');
	//window.location.href = 'btn.html';
});
