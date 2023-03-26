import { setCookie, getCookie } from '../utils/cookie';

export function initModal() {
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
    setCookie('subscribeModalClosed', 'true', { maxAge: 1 * 24 * 60 * 60 });
  };

  window.onclick = (event: MouseEvent) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Replace this with your actual newsletter form submission event
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    setCookie('subscribed', 'true', { maxAge: 365 * 24 * 60 * 60 });
    modal.style.display = 'none';
  });

  // Show the modal only for 1st and 5th visit, and if the user has not subscribed
  if (!subscribed && !closed && (sessionCount === 1 || sessionCount === 5)) {
    modal.style.display = 'block';
  } else {
    modal.style.display = 'none';
  }
}
