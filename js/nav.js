'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */
let currentPage;
/** Show main list of all stories when click site name */

function navAllStories(evt) {
	console.debug('navAllStories', evt);
	hidePageComponents();
	putStoriesOnPage();
	currentPage = 'mainPage';
}

$body.on('click', '#nav-all', navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
	console.debug('navLoginClick', evt);
	hidePageComponents();
	$loginForm.show();
	$signupForm.show();
}

$navLogin.on('click', navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
	console.debug('updateNavOnLogin');
	$('.main-nav-links').show();
	$navLogin.hide();
	$navLogOut.show();
	$navUserProfile.text(`${currentUser.username}`).show();
}

// Handles click on submit nav button
function navSubmitStory(evt) {
	console.debug('navSubmitStory', evt);
	if (currentUser) {
		currentPage = 'submissionPage';
		hidePageComponents();
		$storyForm.show();
	} else {
		alert('You must be logged in to submit a story!');
	}
}

// Puts only user's favorite stories on the page
async function putFavoritesOnPage() {
	console.debug('putFavoritesOnPage');
	$allStoriesList.empty();
	storyList = await StoryList.getStories();
	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		if (story.isFavorite() === 'fas') {
			$allStoriesList.append($story);
		}
	}
	currentPage = 'favoritesPage';
	$allStoriesList.show();
}

// Puts user's own stories on the page and adds a trash can to them
async function putOwnStoriesOnPage() {
	console.debug('putOwnStoriesOnPage');
	$allStoriesList.empty();
	storyList = await StoryList.getStories();

	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		if (currentUser.isOwnStory(story)) {
			$allStoriesList.append($story);
		}
	}
	currentPage = 'ownStoriesPage';
	// Add delete icon to each story of user
	const ownStoriesLis = $allStoriesList.find('li');
	for (const liElem of ownStoriesLis) {
		const newSpan = document.createElement('span');
		newSpan.classList.add('fas', 'fa-trash');
		liElem.prepend(newSpan);
	}
	$allStoriesList.show();
}

// Handles click on favorites nav link
function navShowFavoritesPage(evt) {
	console.debug('navShowFavoritesPage', evt);
	if (currentUser) {
		hidePageComponents();
		putFavoritesOnPage();
	} else {
		alert('You must be logged in to see your favorite stories!');
	}
}

// Handles click on my stories nav link
function navShowOwnStoriesPage(evt) {
	console.debug('navShowOwnStoriesPage', evt);
	if (currentUser) {
		hidePageComponents();
		putOwnStoriesOnPage();
	} else {
		alert("You must be logged in to see stories you've posted!");
	}
}

$navFavorites.on('click', navShowFavoritesPage);
$navMyStories.on('click', navShowOwnStoriesPage);
$navAddStory.on('click', navSubmitStory);