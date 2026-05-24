export const TOKEN_KEY = 'lms_token';
export const ROLE_KEY = 'lms_role';

export function setAuth({ token, role }) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (role) localStorage.setItem(ROLE_KEY, role)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY)
}

