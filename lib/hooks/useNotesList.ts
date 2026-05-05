import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Animated, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { fetchNotes, type FetchNotesOptions } from "../utils/api_calls";
import DataConversion from "../utils/data_conversion";
import { Note } from "../../types";
import { formatToLocalDateString } from "../components/time";
import { queryKeys } from "../query/queryKeys";

const PAGE_SIZE = 20;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function useUserInfo() {
  const authUser = useAuthStore((s) => s.user);
  const [userInitials, setUserInitials] = useState("N/A");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = authUser?.name;
    if (name) {
      setUserName(name.split(" ")[0]);
      setUserInitials(
        name
          .split(" ")
          .map((part) => part[0])
          .join("")
      );
    }
  }, [authUser]);

  return { authUser, userInitials, userName };
}

export function useNotesList(options: Omit<FetchNotesOptions, "limit" | "offset">) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: queryKeys.notes.list(options),
    queryFn: async ({ pageParam = 0 }) => {
      const raw = await fetchNotes({ ...options, limit: PAGE_SIZE, offset: pageParam });
      return DataConversion.convertMediaTypes(raw).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.reduce((total, page) => total + page.length, 0);
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const notes = useMemo(() => data?.pages.flat() ?? [], [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    notes,
    rendering: isLoading,
    hasMore: !!hasNextPage,
    isLoadingMore: isFetchingNextPage,
    handleLoadMore,
    refreshPage: refetch,
  };
}

export function useAnimatedSearch() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const animation = useRef(new Animated.Value(0)).current;

  const toggleSearchBar = useCallback(() => {
    if (isSearchVisible) {
      setSearchQuery("");
      Animated.timing(animation, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => setIsSearchVisible(false));
    } else {
      setIsSearchVisible(true);
      Animated.timing(animation, {
        toValue: SCREEN_WIDTH - 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isSearchVisible, animation]);

  const searchBarWidth = animation.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [0, SCREEN_WIDTH],
  });

  return { isSearchVisible, searchQuery, setSearchQuery, toggleSearchBar, searchBarWidth };
}

export function sortNotes(notes: Note[], sortOption: number): Note[] {
  return [...notes].sort((a, b) => {
    if (sortOption === 1) return new Date(b.time).getTime() - new Date(a.time).getTime();
    if (sortOption === 2) return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    if (sortOption === 3) return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
    return 0;
  });
}

export function filterNotes(notes: Note[], query: string): Note[] {
  if (!query) return notes;
  const lower = query.toLowerCase();
  return notes.filter((note) => {
    const formattedTime = formatToLocalDateString(new Date(note.time));
    return note.title.toLowerCase().includes(lower) || formattedTime.includes(lower);
  });
}
