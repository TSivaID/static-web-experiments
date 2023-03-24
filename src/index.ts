import { YourAnalyticsClass } from './analytics';
import {  checkAndSetAnonymousId } from './create_anonymous_user_id';
import { checkAndSetSessionId, initResetTimeout } from './set_session_id';

const analytics = new YourAnalyticsClass();

checkAndSetAnonymousId();
checkAndSetSessionId();
initResetTimeout();

function initModal() {
  const modal = document.getElementById("subscription-modal") as HTMLElement;
  const showModalButton = document.getElementById("show-modal") as HTMLButtonElement;
  const closeButton = document.querySelector(".close") as HTMLElement;

  if (!modal || !showModalButton || !closeButton) {
    return;
  }

  showModalButton.onclick = () => {
    modal.style.display = "block";
  };

  closeButton.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event: MouseEvent) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  window.onload = () => {
    modal.style.display = "block";
    analytics.trackEvent('Page loaded');
  };
}

initModal();

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

document.addEventListener('DOMContentLoaded', () => {
  const consentBanner = document.getElementById('cookie-consent-banner');
  const acceptCookiesBtn = document.getElementById('accept-cookies');

  function checkCookieConsent(): boolean {
    const consentValue = localStorage.getItem('cookie_consent');
    return consentValue === 'accepted';
  }

  function acceptCookieConsent(): void {
    localStorage.setItem('cookie_consent', 'accepted');
    if (consentBanner) {
      consentBanner.classList.add('hidden');
    }
  }

  if (!checkCookieConsent() && consentBanner) {
    consentBanner.classList.remove('hidden');
  }

  if (acceptCookiesBtn) {
    acceptCookiesBtn.addEventListener('click', () => {
      acceptCookieConsent();
    });
  }
});
