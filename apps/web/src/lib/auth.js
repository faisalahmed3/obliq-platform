import { apiRequest } from "./api";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function setAuthSession(accessToken, user) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

export async function fetchCurrentUser() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export async function refreshAccessToken() {
  return apiRequest("/auth/refresh", {
    method: "POST",
  });
}

export async function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}