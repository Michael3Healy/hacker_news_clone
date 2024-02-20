'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
	console.debug('navAllStories', evt);
	hidePageComponents();
	putStoriesOnPage();
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

$navAddStory.on('click', navSubmitStory);

function navSubmitStory(evt) {
	console.debug('navSubmitStory', evt);
	hidePageComponents();
	$storyForm.show();
}

function putFavoritesOnPage() {
	console.debug('putFavoritesOnPage');
	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		if (story.isFavorite() === 'fas') {
			$allStoriesList.append($story);
		}
	}

	$allStoriesList.show();
}

function putOwnStoriesOnPage() {
	console.debug('putOwnStoriesOnPage');
	$allStoriesList.empty();

	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		if (currentUser.isOwnStory(story)) {
			$allStoriesList.append($story);
		}
	}
	const ownStoriesLis = $allStoriesList.find('li');
	for (const liElem of ownStoriesLis) {
		const newSpan = document.createElement('span');
		newSpan.classList.add('fas', 'fa-trash');
		liElem.prepend(newSpan);
	}

	$allStoriesList.show();
}

function navShowFavoritesPage(evt) {
	console.debug('navShowFavoritesPage', evt);
	hidePageComponents();
	putFavoritesOnPage();
}

$navFavorites.on('click', navShowFavoritesPage);

function navShowOwnStoriesPage(evt) {
	console.debug('navShowOwnStoriesPage', evt);
	hidePageComponents();
	putOwnStoriesOnPage();
}

$navMyStories.on('click', navShowOwnStoriesPage);
