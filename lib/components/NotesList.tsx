import React, { useState } from "react";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { Note } from "../../types";
import { formatToLocalDateString } from "./time";
import { useTheme } from "./ThemeProvider";
import NotesComponent from "./NotesComponent";
import NoteDetailModal, { NoteDetailData } from "../screens/mapPage/NoteDetailModal";

const TEXT_LENGTH = 18;

export interface NoteSwipeActions {
  renderHiddenItem: (data: { item: Note; index: number }, rowMap: any) => React.ReactElement;
  leftActivationValue?: number;
  rightActivationValue?: number;
  leftOpenValue?: number;
  rightOpenValue?: number;
  stopLeftSwipe?: number;
  stopRightSwipe?: number;
  onLeftAction?: (rowKey: string, rowMap: any) => void;
  onRightAction?: (rowKey: string, rowMap: any) => void;
}

interface NotesListProps {
  notes: Note[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  /** Called right before navigating to the edit screen for an unpublished note. */
  onBeforeEditNote?: (note: Note) => void;
  /** Class applied to each row's touchable wrapper (background color differs per screen). */
  itemClassName?: string;
  /** Swipe-to-publish/delete actions; omit for a plain list. */
  swipeActions?: NoteSwipeActions;
}

const NotesList: React.FC<NotesListProps> = ({
  notes,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onBeforeEditNote,
  itemClassName = "bg-secondary",
  swipeActions,
}) => {
  const router = useRouter();
  const { colors, isDarkmode } = useTheme();
  const [selectedNote, setSelectedNote] = useState<NoteDetailData | undefined>(undefined);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleNotePress = (item: Note) => {
    if (!item.isPublished) {
      onBeforeEditNote?.(item);
      router.push({
        pathname: "/edit-note",
        params: { noteData: JSON.stringify({ ...item, time: item.time instanceof Date ? item.time.toISOString() : item.time }) },
      });
    } else {
      setSelectedNote({
        ...item,
        time: formatToLocalDateString(new Date(item.time)),
        description: item.text,
        images: item.media.map((m: { uri: string }) => ({ uri: m.uri })),
      });
      setModalVisible(true);
    }
  };

  const renderItem = (data: any) => {
    const item = data.item;
    const showTime = formatToLocalDateString(new Date(item.time));
    const mediaItem = item.media[0];
    const ImageType = mediaItem?.type;
    let ImageURI = "";
    let IsImage = false;
    if (ImageType === "image") {
      ImageURI = mediaItem.uri;
      IsImage = true;
    } else if (ImageType === "video") {
      ImageURI = mediaItem.thumbnail;
      IsImage = true;
    }
    const resolvedImageURI = Platform.OS === "android" ? String(ImageURI || "") : ImageURI;

    return (
      <TouchableOpacity
        key={item.id}
        testID={`note-item-${data.index}`}
        activeOpacity={1}
        className={itemClassName}
        onPress={() => handleNotePress(item)}
      >
        <NotesComponent
          IsImage={IsImage}
          resolvedImageURI={resolvedImageURI}
          ImageType={ImageType}
          textLength={TEXT_LENGTH}
          showTime={showTime}
          item={item}
          isPublished={item.isPublished}
          isDarkmode={isDarkmode}
        />
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="mb-[100px] items-center py-[50px]">
          <ActivityIndicator size="small" color={colors.foreground} />
        </View>
      );
    }
    if (hasMore) {
      return (
        <TouchableOpacity
          testID="load-more"
          onPress={onLoadMore}
          className="my-1 w-[65%] items-center self-center rounded-lg bg-accent py-5"
        >
          <Text testID="load-more-button" className="font-inter text-base font-normal text-foreground">
            Load More
          </Text>
        </TouchableOpacity>
      );
    }
    return (
      <View className="items-center p-5">
        <Text testID="empty-state-text" className="font-inter text-sm text-gray-500">
          End of the Page
        </Text>
      </View>
    );
  };

  if (notes.length === 0) {
    return (
      <View className="items-center justify-center">
        <LottieView
          testID="no-results-animation"
          source={require("../../assets/animations/noResultFound.json")}
          autoPlay
          loop
          style={{ width: 100, height: 200 }}
        />
        <Text className="font-inter text-[15px] font-normal">No Results Found</Text>
      </View>
    );
  }

  return (
    <>
      <SwipeListView
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListFooterComponent={renderFooter}
        {...(swipeActions ?? {})}
      />
      <NoteDetailModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} note={selectedNote} />
    </>
  );
};

export default NotesList;
