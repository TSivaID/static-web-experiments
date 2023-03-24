import { v4 as uuidv4 } from 'uuid';

function setCookie(name: string, value: string, days: number): void {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = '; expires=' + date.toUTCString();
  document.cookie = name + '=' + value + expires + '; path=/';
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

export function checkAndSetAnonymousId(): void {
  const anonymousId = getCookie('anonymous_user_id');
  if (!anonymousId) {
    setCookie('anonymous_user_id', uuidv4(), 365);
  }
}
