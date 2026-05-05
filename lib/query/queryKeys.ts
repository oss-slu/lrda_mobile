export const queryKeys = {
  notes: {
    all: ["notes"] as const,
    list: (opts: { creatorId?: string; published?: boolean }) => ["notes", opts] as const,
    detail: (id: string) => ["notes", id] as const,
  },
  users: {
    name: (id: string) => ["users", id, "name"] as const,
  },
  profile: {
    notes: (userId: string) => ["profile", "notes", userId] as const,
  },
};
