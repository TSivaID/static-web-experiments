import { setCookie, getCookie, setSessionCookie, deleteCookie } from './cookie';

describe('cookie', () => {
  afterEach(() => {
    // Clear all cookies after each test
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });

  test('set and get cookie', () => {
    setCookie('name', 'John Doe');
    expect(getCookie('name')).toBe('John Doe');
  });

  test('set and get cookie with options', () => {
    setCookie('name', 'John Doe', { maxAge: 3600, path: '/' });
    expect(getCookie('name')).toBe('John Doe');
  });

  test('get non-existent cookie', () => {
    expect(getCookie('non_existent')).toBeNull();
  });

  test('set and get session cookie', () => {
    setSessionCookie('session', '12345');
    expect(getCookie('session')).toBe('12345');
  });
});

describe('deleteCookie', () => {
  const cookieName = 'testCookie';
  const cookieValue = 'testValue';

  beforeEach(() => {
    setCookie(cookieName, cookieValue);
  });

  afterEach(() => {
    deleteCookie(cookieName);
  });

  test('should delete the specified cookie', () => {
    expect(getCookie(cookieName)).toBe(cookieValue);

    deleteCookie(cookieName);

    expect(getCookie(cookieName)).toBeNull();
  });

  test('should delete the specified cookie with path options', () => {
    const path = '/';

    setCookie(cookieName, cookieValue, { path });

    expect(getCookie(cookieName)).toBe(cookieValue);

    deleteCookie(cookieName, { path });

    expect(getCookie(cookieName)).toBeNull();
  });
});
