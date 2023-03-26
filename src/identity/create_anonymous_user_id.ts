import { v4 as uuidv4 } from 'uuid';
import { getCookie, setCookie } from '../utils/cookie';

export function checkAndSetAnonymousId(): void {
  const anonymousId = getCookie('anonymous_user_id');
  const cookieOptions = { maxAge: 365 * 24 * 60 * 60 };

  if (!anonymousId) {
    setCookie('anonymous_user_id', uuidv4(), cookieOptions);
  } else {
    // Update the anonymous_user_id cookie with the same value but reset its maxAge.
    setCookie('anonymous_user_id', anonymousId, cookieOptions);
  }
}
