import { v4 as uuidv4 } from 'uuid';
import { deleteCookie, getCookie, setCookie } from '../utils/cookie';

export function checkAndSetSessionId(): void {
  const sessionId = getCookie('session_id');
  if (!sessionId) {
    // Generate a new session_id and set the cookie
    const newSessionId = uuidv4();
    setCookie('session_id', newSessionId);

    // Increment the sessionCount cookie
    const sessionCount = parseInt(getCookie('session_count') || '0', 10);
    const newSessionCount = (sessionCount + 1).toString();
    setCookie('session_count', newSessionCount, { maxAge: 30 * 24 * 60 * 60 });
  }
}

// Initialize the inactivity timer
export function initInactivityTimer() {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function resetTimeout(): void {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      deleteCookie('session_id'); // Delete the session_id cookie
      checkAndSetSessionId(); // Create a new session_id after the old one has been deleted
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Listen for user activity events to reset the timeout
  document.addEventListener('mousemove', resetTimeout);
  document.addEventListener('mousedown', resetTimeout);
  document.addEventListener('keypress', resetTimeout);
  document.addEventListener('touchmove', resetTimeout);
  document.addEventListener('scroll', resetTimeout);
}
