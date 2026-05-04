import { useState, useEffect, useCallback, useRef } from "react";
import { Animated, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { fetchNotes, type FetchNotesOptions } from "../utils/api_calls";
import DataConversion from "../utils/data_conversion";
import { Note } from "../../types";
import { formatToLocalDateString } from "../components/time";
import ToastMessage from "react-native-toast-message";

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
      setUserInitials(name.split(" ").map((part) => part[0]).join(""));
    }
  }, [authUser]);

  return { authUser, userInitials, userName };
}

export function useNotesList(
  getFetchOptions: () => Omit<FetchNotesOptions, "limit" | "offset">,
  deps: unknown[] = [],
) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [rendering, setRendering] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [updateCounter, setUpdateCounter] = useState(0);

  const getFetchOptionsRef = useRef(getFetchOptions);
  getFetchOptionsRef.current = getFetchOptions;

  const refreshPage = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setUpdateCounter((prev) => prev + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPage();
    }, [refreshPage]),
  );

  const doFetch = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setRendering(true);
      } else {
        setIsLoadingMore(true);
      }

      const offset = (pageNum - 1) * PAGE_SIZE;
      const baseOptions = getFetchOptionsRef.current();
      const data = await fetchNotes({ ...baseOptions, limit: PAGE_SIZE, offset });
      const converted = DataConversion.convertMediaTypes(data).sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      );

      if (pageNum === 1) {
        setNotes(converted);
      } else {
        setNotes((prev) => [...prev, ...converted]);
      }

      setHasMore(converted.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching notes:", error);
      ToastMessage.show({
        type: "error",
        text1: "Error fetching notes",
        text2: (error as Error).message,
      });
    } finally {
      setRendering(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setRendering(true);
    setPage(1);
    setHasMore(true);
    doFetch(1);
  }, [updateCounter, doFetch, ...deps]);

  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore) {
      const nextPage = page + 1;
      await doFetch(nextPage);
      setPage(nextPage);
    }
  }, [hasMore, isLoadingMore, page, doFetch]);

  return { notes, setNotes, rendering, hasMore, isLoadingMore, handleLoadMore, refreshPage };
}

export function useAnimatedSearch() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const animation = useRef(new Animated.Value(0)).current;

  const toggleSearchBar = useCallback(() => {
    if (isSearchVisible) {
      setSearchQuery("");
      Animated.timing(animation, { toValue: 0, duration: 300, useNativeDriver: false }).start(() =>
        setIsSearchVisible(false),
      );
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
