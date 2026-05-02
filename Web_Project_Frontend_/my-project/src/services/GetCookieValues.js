function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/** Read auth token on each call (module-level reads stay stale after login). */
export function getAuthToken() {
  return getCookie('authToken');
}

export function getUserRole() {
  return getCookie('userRole');
}

export function getLoggedInId() {
  return getCookie('userId');
}

export function getIsSubscribed() {
  const v = getCookie('isSubscribed');
  if (v === 'true') return true;
  return false;
}
