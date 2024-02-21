'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories(0, 15);
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
	// console.debug("generateStoryMarkup", story);

	const hostName = story.getHostName();
	return $(`
      <li id="${story.storyId}">
      <i class="${story.isFavorite()} fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
    <strong>${story.title}</strong>
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage() {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();
	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
	currentPage = 'mainPage'
}

// Adds a new story submitted by the current user
async function submitStory(evt) {
	evt.preventDefault();
	console.debug('submitStory', evt);

	const author = $('#author').val();
	const title = $('#title').val();
	const url = $('#url').val();

	const response = await storyList.addStory(currentUser, {
		title,
		author,
		url,
	});
	$storyForm.trigger('reset');
	location.reload();

	generateStoryMarkup(response.data.story);
	putStoriesOnPage();
}

$storyForm.on('submit', submitStory);

// Returns a story object from a storyId
const getStoryFromId = async storyId => {
	const response = await axios.get(`${BASE_URL}/stories/${storyId}`);
	return response.data.story;
};

// Event delegation to listen for clicks on stars (favorite) or trash (delete)
$allStoriesList.on('click', async function (evt) {
	const storyId = evt.target.parentElement.id;

	if (currentUser) {
		if (evt.target.classList.contains('fa-star')) {
			// If not a favorite...
			if (evt.target.classList.contains('far')) {
				// Make the star solid and add it to favorites in API
				evt.target.classList.remove('far');
				evt.target.classList.add('fas');
				currentUser.addFavorite(currentUser.loginToken, currentUser.username, await getStoryFromId(storyId));

				// Otherwise, make the star regular and remove it from favorites in API
			} else {
				evt.target.classList.remove('fas');
				evt.target.classList.add('far');
				currentUser.removeFavorite(currentUser.loginToken, currentUser.username, await getStoryFromId(storyId));
			}

			// If the target is the trash can, remove the story from the dom and let API know it's gone
		} else if (evt.target.classList.contains('fa-trash')) {
			await axios({
				url: `${BASE_URL}/stories/${storyId}`,
				method: 'DELETE',
				data: { token: currentUser.loginToken },
			});
			currentUser.ownStories = currentUser.ownStories.filter(s => s.storyId !== storyId);
			evt.target.parentElement.remove();
		}
	}
});

// Variable to ensure right amount of stories are skipped when scrolling to the bottom
let loadCount = 1;

// Load more stories onto the dom, 15 at a time
async function loadMoreStories() {
	console.debug('loadMoreStories')
	const storiesPerPage = 15;
	let skip = storiesPerPage * loadCount;
	const newStories = await StoryList.getStories(skip, 15);

	for (let newStory of newStories.stories) {
		let storyExists = false;
		for (let currStory of storyList.stories) {
			if (newStory.storyId === currStory.storyId) {
				storyExists = true;
				break;
			}
		}
		if (!storyExists) {
			storyList.stories.push(newStory);
		}
	}
	putStoriesOnPage();
	loadCount++;
}

const reachedBottomOfPage = () => {
	return this.window.scrollY + this.window.innerHeight >= this.document.documentElement.scrollHeight;
};

window.addEventListener('scroll', function () {
	if (reachedBottomOfPage() && currentPage === 'mainPage') {
		loadMoreStories();
	}
});
