import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateNote } from "../lib/hooks/mutations/useCreateNote";
import { useUpdateNote } from "../lib/hooks/mutations/useUpdateNote";
import * as api from "../lib/utils/api_calls";

jest.mock("../lib/utils/api_calls", () => ({
  createNote: jest.fn(),
  updateNote: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  expoConfig: { extra: {} },
}));

let queryClient: QueryClient;

afterEach(() => {
  queryClient.clear();
});

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCreateNote", () => {
  it("calls createNote and invalidates notes queries on success", async () => {
    const created = { id: "new-1", title: "Test" };
    (api.createNote as jest.Mock).mockResolvedValue(created);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateNote(), { wrapper });

    result.current.mutate({
      title: "Test",
      text: "body",
      isPublished: false,
      tags: [],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.createNote).toHaveBeenCalledWith(expect.objectContaining({ title: "Test", isPublished: false }));
    expect(result.current.data).toEqual(created);
  });
});

describe("useUpdateNote", () => {
  it("calls updateNote and invalidates notes queries on success", async () => {
    const updated = { id: "1", title: "Updated" };
    (api.updateNote as jest.Mock).mockResolvedValue(updated);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateNote(), { wrapper });

    result.current.mutate({ id: "1", title: "Updated" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(api.updateNote).toHaveBeenCalledWith(expect.objectContaining({ id: "1", title: "Updated" }));
    expect(result.current.data).toEqual(updated);
  });
});
