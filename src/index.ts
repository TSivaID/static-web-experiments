import { YourAnalyticsClass } from './analytics';
import { checkAndSetAnonymousId } from './identity/create_anonymous_user_id';
import { checkAndSetSessionId, initInactivityTimer } from './identity/set_session_id';
import { initModal } from './components/subscribe_newsletter';
import { initConsentBanner } from './components/consent_banner';

const analytics = new YourAnalyticsClass();

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
});
