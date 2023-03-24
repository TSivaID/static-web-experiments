import { v4 as uuidv4 } from 'uuid';

function setCookie(name: string, value: string, expires: number | null = null, path: string = '/'): void {
  let cookieString = name + '=' + value + ';';

  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + expires);
    cookieString += ' expires=' + date.toUTCString() + ';';
  }

  cookieString += ' path=' + path + ';';
  document.cookie = cookieString;
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

export function checkAndSetSessionId(): void {
  const sessionId = getCookie('session_id');
  if (!sessionId) {
    setCookie('session_id', uuidv4(), null);
  }
}

// Initialize the inactivity timer
export function initResetTimeout() {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function resetTimeout(): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      setCookie('session_id', '', -1); // Delete the session_id cookie
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Listen for user activity events to reset the timeout
  document.addEventListener('mousemove', resetTimeout);
  document.addEventListener('mousedown', resetTimeout);
  document.addEventListener('keypress', resetTimeout);
  document.addEventListener('touchmove', resetTimeout);
  document.addEventListener('scroll', resetTimeout);
}
