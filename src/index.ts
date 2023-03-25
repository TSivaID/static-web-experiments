import { YourAnalyticsClass } from './analytics';
import { checkAndSetAnonymousId } from './create_anonymous_user_id';
import { checkAndSetSessionId, initResetTimeout } from './set_session_id';

const analytics = new YourAnalyticsClass();

checkAndSetAnonymousId();
checkAndSetSessionId();
initResetTimeout();

function setCookie(name: string, value: string, days: number): void {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = '; expires=' + date.toUTCString();
  document.cookie = name + '=' + value + expires + '; path=/';
}

function getCookie(name: string): string | null {
  const nameWithEq = name + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let cookie of cookieArray) {
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameWithEq) === 0) {
      return cookie.substring(nameWithEq.length, cookie.length);
    }
  }
  return null;
}

function initModal() {
  const modal = document.getElementById('subscription-modal') as HTMLElement;
  const showModalButton = document.getElementById('show-modal') as HTMLButtonElement;
  const closeButton = document.querySelector('.close') as HTMLElement;

  if (!modal || !showModalButton || !closeButton) {
    return;
  }

  const sessionCount = parseInt(getCookie('session_count') || '0', 10);
  const subscribed = getCookie('subscribed') === 'true';
  const closed = getCookie('subscribeModalClosed') === 'true';

  showModalButton.onclick = () => {
    modal.style.display = 'block';
  };

  closeButton.onclick = () => {
    modal.style.display = 'none';
    setCookie('subscribeModalClosed', 'true', 1);
  };

  window.onclick = (event: MouseEvent) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Replace this with your actual newsletter form submission event
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setCookie('subscribed', 'true', 365);
    modal.style.display = 'none';
  });

  // Show the modal only for 1st and 5th visit, and if the user has not subscribed
  if (!subscribed && !closed && (sessionCount === 1 || sessionCount === 5)) {
    modal.style.display = 'block';
  } else {
    modal.style.display = 'none';
  }
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
