import { WebAnalyticsFacade } from './analytics';
import { checkAndSetAnonymousId } from './identity/create-anonymous-user-id';
import { checkAndSetSessionId, initInactivityTimer } from './identity/set-session-id';
import { initModal } from './components/subscribe-newsletter';
import { initConsentBanner } from './components/consent-banner';

const webAnalytics = new WebAnalyticsFacade();
webAnalytics.initialize();

checkAndSetAnonymousId();
checkAndSetSessionId();
initInactivityTimer();
initModal();
initConsentBanner();

document.addEventListener('DOMContentLoaded', () => {
  // const urlParams = new URLSearchParams(window.location.search);
  // const title = urlParams.get('title') || 'Default Title';
  const hash = window.location.hash.substring(1); // Remove the leading #
  const decodedHash = decodeURIComponent(hash);
  const title = decodedHash || 'Default Title';

  const storyTitleElement = document.getElementById('story-title');
  if (storyTitleElement) {
    storyTitleElement.textContent = title;
  }

  setTimeout(() => {
    const html = `<article
        class="card"
        data-ae-trigger="element-visible"
        data-ae-observer="once"
        data-event-conf='{
              "name":"element_viewed",
              "vars": {
                "key1": "key1_value",
                "key2": "key2_value",
                "render_method": "lazy"
              },
              "providers": {
                "dummy_analytics": {
                  "keys": [
                    "key1",
                    "key2",
                    "render_method"
                  ],
                  "extra_keys": [
                    "page_var1",
                    "page_var2"
                  ],
                  "exclude_keys": [
                    "common_var1"
                  ],
                  "key_mapping": {
                    "key1": "key1_name",
                    "key2": "key2_name"
                  }
                },
                "mock_api_analytics": {
                  "keys": [
                    "key1",
                    "key2",
                    "render_method"
                  ]
                }
              }
            }'
      >
        <img src="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="News 9" />
        <h2><a href="story.html#News Article 9">News Article 9</a></h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </article>`;

    // get this selector .card-container
    const cardContainer = document.querySelector('.card-container');
    if (cardContainer) {
      // create a new element using the html string
      const cardElement = document.createRange().createContextualFragment(html);
      // append the new element to the card container
      cardContainer.appendChild(cardElement);
    }
  }, 2000);
});
