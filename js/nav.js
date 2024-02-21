'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

let currentPage = 'main';

/** Show main list of all stories when click site name */

function navAllStories(evt) {
	console.debug('navAllStories', evt);
	hidePageComponents();
	putStoriesOnPage();
	currentPage = 'main';
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

function navSubmitStory(evt) {
	console.debug('navSubmitStory', evt);
	if (currentUser) {
		hidePageComponents();
		$storyForm.show();
	} else {
		alert('You must be logged in to submit a story!');
	}
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

function putOwnStoriesOnPage(skip=0) {
	console.debug('putOwnStoriesOnPage');
	$allStoriesList.empty();
	let storiesRendered = 0;

	for (let i = skip; i < storyList.stories.length; i++) {
		const story = storyList.stories[i];
		if (storiesRendered < 15) {
			const $story = generateStoryMarkup(story);
			if (currentUser.isOwnStory(story)) {
				$allStoriesList.append($story);
				storiesRendered += 1;
			}
		} else {
			break;
		}
	}
	storiesRendered = 0;

	// Add delete icon to each story of user
	const ownStoriesLis = $allStoriesList.find('li');
	for (const liElem of ownStoriesLis) {
		const newSpan = document.createElement('span');
		newSpan.classList.add('fas', 'fa-trash');
		liElem.prepend(newSpan);
	}
	currentPage = 'ownStories';
	$allStoriesList.show();
}

function navShowFavoritesPage(evt) {
	console.debug('navShowFavoritesPage', evt);
	if (currentUser) {
		hidePageComponents();
		putFavoritesOnPage();
		currentPage = 'favorites';
	} else {
		alert('You must be logged in to see your favorite stories!');
	}
}

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
