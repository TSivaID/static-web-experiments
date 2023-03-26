function setupConsentBanner() {
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
}

export const initConsentBanner = (): void => {
  setupConsentBanner();
};
