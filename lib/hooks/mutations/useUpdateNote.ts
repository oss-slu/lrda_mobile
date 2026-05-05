import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNote, type UpdateNoteInput } from "../../utils/api_calls";
import { queryKeys } from "../../query/queryKeys";

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNoteInput) => updateNote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.notes(""), exact: false });
    },
  });
}
