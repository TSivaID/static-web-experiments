import { YourAnalyticsClass } from './analytics';
import { checkAndSetAnonymousId } from './identity/create-anonymous-user-id';
import { checkAndSetSessionId, initInactivityTimer } from './identity/set-session-id';
import { initModal } from './components/subscribe-newsletter';
import { initConsentBanner } from './components/consent-banner';

const analytics = new YourAnalyticsClass();
analytics.trackEvent('page_load');

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
