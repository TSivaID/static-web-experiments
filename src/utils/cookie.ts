/**
 * @module cookie
 * @author T. Siva <t.siva AT outlook.com>
 * @license MIT
 * @description
 * A simple utility module to handle browser cookies with all possible options.
 *
 * Usage example:
 * ```
 * import { setCookie, getCookie, setSessionCookie } from './cookie';
 *
 * setCookie('name', 'John Doe', { maxAge: 3600, path: '/', secure: true });
 * const name = getCookie('name');
 * setSessionCookie('session', '12345');
 * ```
 */

/**
 * Sets a cookie with the given name, value, and options.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {object} [options] - Optional options for the cookie.
 * @param {number} [options.maxAge] - The max age of the cookie in seconds.
 * @param {string} [options.path] - The path for the cookie.
 * @param {string} [options.domain] - The domain for the cookie.
 * @param {boolean} [options.secure] - Indicates whether the cookie should be secure.
 * @param {string} [options.sameSite] - The SameSite attribute for the cookie.
 */
export function setCookie(
  name: string,
  value: string,
  options?: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }
): void {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options) {
    if (options.maxAge !== undefined) {
      cookie += `; max-age=${options.maxAge}`;
    }
    if (options.path) {
      cookie += `; path=${options.path}`;
    }
    if (options.domain) {
      cookie += `; domain=${options.domain}`;
    }
    if (options.secure) {
      cookie += '; secure';
    }
    if (options.sameSite) {
      cookie += `; samesite=${options.sameSite}`;
    }
  }

  document.cookie = cookie;
}

/**
 * Gets the value of a cookie by its name.
 * @param {string} name - The name of the cookie.
 * @returns {string | null} The value of the cookie or null if not found.
 */
export function getCookie(name: string): string | null {
  const cookieName = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    let trimmedCookie = cookie.trim();
    if (trimmedCookie.startsWith(cookieName)) {
      return decodeURIComponent(trimmedCookie.slice(cookieName.length));
    }
  }

  return null;
}

/**
 * Sets a session cookie with the given name and value.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 */
export function setSessionCookie(name: string, value: string): void {
  setCookie(name, value);
}

/**
 * Deletes a cookie by setting its max-age to 0.
 * @param {string} name - The name of the cookie to delete.
 * @param {object} [options] - Optional settings for the deletion, such as path and domain.
 */
export function deleteCookie(name: string, options?: { path?: string; domain?: string }) {
  setCookie(name, '', { maxAge: 0, ...(options || {}) });
}
