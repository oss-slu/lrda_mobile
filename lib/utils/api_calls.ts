import Constants from "expo-constants";
import { useAuthStore } from "../stores/authStore";
import { Tag } from "../../types";

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };
const API_BASE_URL = extra.apiBaseUrl || "http://localhost:3002";

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = useAuthStore.getState().sessionToken;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export default class ApiService {
  static async fetchMessages(
    global: boolean,
    published: boolean,
    userId: string,
    limit = 150,
    skip = 0,
    allResults: any[] = []
  ): Promise<any[]> {
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("offset", skip.toString());

      if (!global && userId) {
        params.set("creatorId", userId);
      }
      if (global || published) {
        params.set("published", "true");
      }

      const url = `${API_BASE_URL}/api/notes?${params.toString()}`;
      const response = await fetch(url, { method: "GET", headers });
      const data = await response.json();

      if (data.length > 0) {
        allResults = allResults.concat(data);
        if (data.length === limit) {
          return this.fetchMessages(global, published, userId, limit, skip + data.length, allResults);
        }
      }

      return allResults;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  static async fetchMessagesBatch(global: boolean, published: boolean, userId: string, limit = 20, skip = 0): Promise<any[]> {
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("offset", skip.toString());

      if (!global && userId) {
        params.set("creatorId", userId);
      }
      if (published) {
        params.set("published", "true");
      } else if (!global && userId) {
        params.set("published", "false");
      }

      const url = `${API_BASE_URL}/api/notes?${params.toString()}`;
      const response = await fetch(url, { method: "GET", headers });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  static async fetchMapsMessagesBatch(global: boolean, published: boolean, userId: string, limit = 20, skip = 0): Promise<any[]> {
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("offset", skip.toString());
      params.set("published", "true");

      const url = `${API_BASE_URL}/api/notes?${params.toString()}`;
      const response = await fetch(url, { method: "GET", headers });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  static async fetchUserData(userId: string): Promise<any | null> {
    try {
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/api/users/${userId}`;
      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) {
        console.log("User not found for ID:", userId);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  static async fetchCreatorName(creatorId: string): Promise<string> {
    try {
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/api/users/${creatorId}`;
      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) {
        return "Creator not available";
      }

      const data = await response.json();
      return data.name || "Unknown Creator";
    } catch (error) {
      console.error("Error fetching creator name:", error);
      return "Error retrieving creator";
    }
  }

  static async deleteNoteFromAPI(id: string): Promise<boolean> {
    try {
      const headers = getAuthHeaders();
      const url = `${API_BASE_URL}/api/notes/${id}`;
      const response = await fetch(url, { method: "DELETE", headers });

      if (response.status === 204) {
        return true;
      } else {
        throw new Error(`Delete failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  }

  static async writeNewNote(note: any): Promise<Response> {
    const headers = getAuthHeaders();
    const tags: Tag[] = (note.tags || []).map((t: string) => ({ label: t, origin: "user" }));

    const body = {
      title: note.title,
      text: note.text,
      latitude: note.latitude != null ? Number(note.latitude) || null : null,
      longitude: note.longitude != null ? Number(note.longitude) || null : null,
      isPublished: note.isPublished ?? note.published ?? false,
      tags,
      time: note.time ? new Date(note.time).toISOString() : new Date().toISOString(),
      media: (note.media || []).map((m: any) => ({
        type: m.type,
        uri: m.uri,
        thumbnailUri: m.thumbnail || undefined,
        uuid: m.uuid || undefined,
      })),
      audio: (note.audio || []).map((a: any) => ({
        uri: a.uri,
        name: a.name || undefined,
        duration: a.duration || undefined,
        uuid: a.uuid || undefined,
      })),
    };

    return fetch(`${API_BASE_URL}/api/notes`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  static async overwriteNote(note: any): Promise<Response> {
    const headers = getAuthHeaders();
    const tags: Tag[] = (note.tags || []).map((t: string | Tag) =>
      typeof t === "string" ? { label: t, origin: "user" as const } : t
    );

    const body: Record<string, any> = {
      title: note.title,
      text: note.text,
      isPublished: note.isPublished ?? note.published ?? false,
      tags,
      time: note.time ? new Date(note.time).toISOString() : undefined,
      media: (note.media || []).map((m: any) => ({
        type: m.type,
        uri: m.uri,
        thumbnailUri: m.thumbnail || m.thumbnailUri || undefined,
        uuid: m.uuid || undefined,
      })),
      audio: (note.audio || []).map((a: any) => ({
        uri: a.uri,
        name: a.name || undefined,
        duration: a.duration || undefined,
        uuid: a.uuid || undefined,
      })),
    };

    if (note.latitude != null) body.latitude = Number(note.latitude) || null;
    if (note.longitude != null) body.longitude = Number(note.longitude) || null;

    return fetch(`${API_BASE_URL}/api/notes/${note.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
  }

  static async searchMessages(query: string): Promise<any[]> {
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      params.set("search", query);
      params.set("published", "true");
      params.set("limit", "50");

      const url = `${API_BASE_URL}/api/notes?${params.toString()}`;
      const response = await fetch(url, { method: "GET", headers });
      return await response.json();
    } catch (error) {
      console.error("Error searching messages:", error);
      throw error;
    }
  }
}
