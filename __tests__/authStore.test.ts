import { useAuthStore } from "../lib/stores/authStore";
import { authClient } from "../lib/auth/client";

jest.mock("../lib/auth/client", () => ({
  authClient: {
    getSession: jest.fn(),
    signIn: { email: jest.fn() },
    signOut: jest.fn(),
  },
}));

const mockedAuthClient = authClient as jest.Mocked<typeof authClient>;

beforeEach(() => {
  useAuthStore.setState({ user: null, sessionToken: null, isAuthenticated: false, isReady: false });
  jest.clearAllMocks();
});

describe("authStore.initialize", () => {
  it("restores session and sets authenticated state", async () => {
    (mockedAuthClient.getSession as jest.Mock).mockResolvedValue({
      data: {
        user: { id: "u1", name: "Test User", email: "test@test.com" },
        session: { token: "restored-token" },
      },
      error: null,
    });

    const result = await useAuthStore.getState().initialize();

    expect(result).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isReady).toBe(true);
    expect(state.sessionToken).toBe("restored-token");
    expect(state.user?.id).toBe("u1");
  });

  it("sets unauthenticated when no session exists", async () => {
    (mockedAuthClient.getSession as jest.Mock).mockResolvedValue({ data: null, error: null });

    const result = await useAuthStore.getState().initialize();

    expect(result).toBe(false);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isReady).toBe(true);
    expect(state.sessionToken).toBeNull();
  });
});

describe("authStore.login", () => {
  it("sets user and token on success", async () => {
    (mockedAuthClient.signIn.email as jest.Mock).mockResolvedValue({
      data: {
        user: { id: "u1", name: "Test" },
        token: "login-token",
      },
      error: null,
    });

    await useAuthStore.getState().login("test@test.com", "password");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.sessionToken).toBe("login-token");
  });

  it("throws on auth error", async () => {
    (mockedAuthClient.signIn.email as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: "Invalid email or password" },
    });

    await expect(useAuthStore.getState().login("bad@test.com", "wrong")).rejects.toThrow("Invalid email or password");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe("authStore.logout", () => {
  it("clears auth state", async () => {
    useAuthStore.setState({ user: { id: "u1" } as any, sessionToken: "tok", isAuthenticated: true });
    (mockedAuthClient.signOut as jest.Mock).mockResolvedValue(undefined);

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.sessionToken).toBeNull();
  });
});
