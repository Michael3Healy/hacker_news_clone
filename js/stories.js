'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
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
    ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

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

const getStoryFromId = async storyId => {
	const response = await axios.get(`${BASE_URL}/stories/${storyId}`);
	return response.data.story;
};

$allStoriesList.on('click', async function (evt) {
  const storyId = evt.target.parentElement.id;

	if (evt.target.classList.contains('fa-star')) {

    // If not a favorite...
		if (evt.target.classList.contains('far')) {

      // Make the star solid and add it to favorites
			evt.target.classList.remove('far');
			evt.target.classList.add('fas');
			currentUser.addFavorite(
				currentUser.loginToken,
				currentUser.username,
				await getStoryFromId(storyId)
			);

      // Otherwise, make the star regular and remove it from favorites
		} else {
			evt.target.classList.remove('fas');
			evt.target.classList.add('far');
			currentUser.removeFavorite(
				currentUser.loginToken,
				currentUser.username,
				await getStoryFromId(storyId)
			);
		}

    // If the target is the trash can, remove it from the dom and let API know it's gone
	} else if (evt.target.classList.contains('fa-trash')) {
    await axios({
			url: `${BASE_URL}/stories/${storyId}`,
			method: 'DELETE',
			data: { token: currentUser.loginToken },
		});
    currentUser.ownStories = currentUser.ownStories.filter(s => s.storyId !== storyId);
    evt.target.parentElement.remove();
  }
});