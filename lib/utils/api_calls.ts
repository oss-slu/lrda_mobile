import Constants from "expo-constants";
import { useAuthStore } from "../stores/authStore";
import type { Note, Tag, UserData } from "../../types";
import type { AudioType, Media } from "../models/media_class";

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

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ApiError(text || `Request failed with status ${response.status}`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

// --- Notes ---

interface FetchNotesOptions {
  creatorId?: string;
  published?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export async function fetchNotes(options: FetchNotesOptions = {}): Promise<Note[]> {
  const headers = getAuthHeaders();
  const params = new URLSearchParams();

  if (options.limit != null) params.set("limit", options.limit.toString());
  if (options.offset != null) params.set("offset", options.offset.toString());
  if (options.creatorId) params.set("creatorId", options.creatorId);
  if (options.published != null) params.set("published", options.published.toString());
  if (options.search) params.set("search", options.search);

  const url = `${API_BASE_URL}/api/notes?${params.toString()}`;
  const response = await fetch(url, { method: "GET", headers });
  return parseResponse<Note[]>(response);
}

export async function fetchAllNotes(options: Omit<FetchNotesOptions, "limit" | "offset"> = {}): Promise<Note[]> {
  const limit = 150;
  const allResults: Note[] = [];
  let offset = 0;

  while (true) {
    const batch = await fetchNotes({ ...options, limit, offset });
    allResults.push(...batch);
    if (batch.length < limit) break;
    offset += batch.length;
  }

  return allResults;
}

interface CreateNoteInput {
  title: string;
  text: string;
  latitude?: number | null;
  longitude?: number | null;
  isPublished: boolean;
  tags: string[];
  time?: string | Date;
  media?: Media[];
  audio?: AudioType[];
}

function formatTags(tags: (string | Tag)[]): Tag[] {
  return tags.map((t) => (typeof t === "string" ? { label: t, origin: "user" as const } : t));
}

function formatMedia(media: Media[]) {
  return media.map((m) => ({
    type: m.type,
    uri: m.uri,
    thumbnailUri: (m as any).thumbnail || (m as any).thumbnailUri || undefined,
    uuid: m.uuid || undefined,
  }));
}

function formatAudio(audio: AudioType[]) {
  return audio.map((a) => ({
    uri: a.uri,
    name: a.name || undefined,
    duration: a.duration || undefined,
    uuid: a.uuid || undefined,
  }));
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const headers = getAuthHeaders();
  const body = {
    title: input.title,
    text: input.text,
    latitude: input.latitude != null ? Number(input.latitude) || null : null,
    longitude: input.longitude != null ? Number(input.longitude) || null : null,
    isPublished: input.isPublished,
    tags: formatTags(input.tags),
    time: input.time ? new Date(input.time).toISOString() : new Date().toISOString(),
    media: formatMedia(input.media || []),
    audio: formatAudio(input.audio || []),
  };

  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return parseResponse<Note>(response);
}

interface UpdateNoteInput {
  id: string;
  title?: string;
  text?: string;
  latitude?: number | null;
  longitude?: number | null;
  isPublished?: boolean;
  tags?: (string | Tag)[];
  time?: string | Date;
  media?: Media[];
  audio?: AudioType[];
}

export async function updateNote(input: UpdateNoteInput): Promise<Note> {
  const headers = getAuthHeaders();
  const body: Record<string, unknown> = {};

  if (input.title !== undefined) body.title = input.title;
  if (input.text !== undefined) body.text = input.text;
  if (input.isPublished !== undefined) body.isPublished = input.isPublished;
  if (input.tags !== undefined) body.tags = formatTags(input.tags);
  if (input.time !== undefined) body.time = new Date(input.time).toISOString();
  if (input.media !== undefined) body.media = formatMedia(input.media);
  if (input.audio !== undefined) body.audio = formatAudio(input.audio);
  if (input.latitude != null) body.latitude = Number(input.latitude) || null;
  if (input.longitude != null) body.longitude = Number(input.longitude) || null;

  const response = await fetch(`${API_BASE_URL}/api/notes/${input.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  return parseResponse<Note>(response);
}

export async function deleteNote(id: string): Promise<void> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: "DELETE",
    headers,
  });
  await parseResponse<void>(response);
}

// --- Users ---

export async function fetchUser(userId: string): Promise<UserData | null> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "GET",
    headers,
  });

  if (response.status === 404) return null;
  return parseResponse<UserData>(response);
}

export async function fetchCreatorName(creatorId: string): Promise<string> {
  const user = await fetchUser(creatorId);
  return user?.name || "Unknown Creator";
}

