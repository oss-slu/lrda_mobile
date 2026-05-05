import { useAuthStore } from "../lib/stores/authStore";

jest.mock("../lib/auth/client", () => ({
  authClient: {
    getSession: jest.fn(),
    signIn: { email: jest.fn() },
    signOut: jest.fn(),
  },
}));

jest.mock("expo-constants", () => ({
  expoConfig: { extra: { apiBaseUrl: "http://test-api" } },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetchNotes, createNote, updateNote, deleteNote, fetchCreatorName } = require("../lib/utils/api_calls");

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  useAuthStore.setState({ sessionToken: "test-token" });
});

describe("fetchNotes", () => {
  it("sends GET with auth header and query params", async () => {
    const notes = [{ id: "1", title: "Test" }];
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(notes) });

    const result = await fetchNotes({ creatorId: "user-1", published: true, limit: 10, offset: 0 });

    expect(result).toEqual(notes);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/notes?");
    expect(url).toContain("creatorId=user-1");
    expect(url).toContain("published=true");
    expect(url).toContain("limit=10");
    expect(opts.headers.Authorization).toBe("Bearer test-token");
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401, text: () => Promise.resolve("Unauthorized") });

    await expect(fetchNotes()).rejects.toThrow("Unauthorized");
  });

  it("omits auth header when no session token", async () => {
    useAuthStore.setState({ sessionToken: null });
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve([]) });

    await fetchNotes();

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBeUndefined();
  });
});

describe("createNote", () => {
  it("sends POST with formatted body", async () => {
    const created = { id: "new-1", title: "New Note" };
    mockFetch.mockResolvedValue({ ok: true, status: 201, json: () => Promise.resolve(created) });

    const result = await createNote({
      title: "New Note",
      text: "<p>body</p>",
      isPublished: false,
      tags: ["fieldwork", "urban"],
      latitude: 38.63,
      longitude: -90.19,
    });

    expect(result).toEqual(created);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://test-api/api/notes");
    expect(opts.method).toBe("POST");

    const body = JSON.parse(opts.body);
    expect(body.tags).toEqual([
      { label: "fieldwork", origin: "user" },
      { label: "urban", origin: "user" },
    ]);
    expect(body.latitude).toBe(38.63);
  });
});

describe("updateNote", () => {
  it("sends PATCH with only provided fields", async () => {
    const updated = { id: "1", title: "Updated" };
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(updated) });

    await updateNote({ id: "1", title: "Updated" });

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://test-api/api/notes/1");
    expect(opts.method).toBe("PATCH");

    const body = JSON.parse(opts.body);
    expect(body.title).toBe("Updated");
    expect(body.text).toBeUndefined();
    expect(body.tags).toBeUndefined();
  });
});

describe("deleteNote", () => {
  it("sends DELETE and handles 204", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204 });

    await expect(deleteNote("note-1")).resolves.toBeUndefined();

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://test-api/api/notes/note-1");
    expect(opts.method).toBe("DELETE");
  });
});

describe("fetchCreatorName", () => {
  it("returns name from user data", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ name: "Jane Doe" }) });

    const name = await fetchCreatorName("user-1");
    expect(name).toBe("Jane Doe");
  });

  it("returns fallback for unknown user", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, text: () => Promise.resolve("") });

    const name = await fetchCreatorName("missing");
    expect(name).toBe("Unknown Creator");
  });
});
