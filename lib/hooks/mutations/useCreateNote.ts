import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, type CreateNoteInput } from "../../utils/api_calls";
import { queryKeys } from "../../query/queryKeys";

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.notes(""), exact: false });
    },
  });
}
