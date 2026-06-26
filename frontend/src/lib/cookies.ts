export function setAuthCookie(accessToken: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `access_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function removeAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
}

export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? match[1] : null;
}

export function setUserRoleCookie(role: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `user_role=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function removeUserRoleCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'user_role=; path=/; max-age=0; SameSite=Lax';
}

export function getUserRoleCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)user_role=([^;]*)/);
  return match ? match[1] : null;
}
