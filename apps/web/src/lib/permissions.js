import { apiRequest } from "@/lib/api";

export async function fetchPermissions() {
  return apiRequest("/permissions", {
    method: "GET",
  });
}

export async function fetchUserById(id) {
  return apiRequest(`/users/${id}`, {
    method: "GET",
  });
}

export async function updateUserPermissions(id, overrides) {
  return apiRequest(`/users/${id}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ overrides }),
  });
}