import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";

function TagWindow({ tags, setTags }: { tags: string[]; setTags: React.Dispatch<React.SetStateAction<string[]>> }) {
  const [inputText, setInputText] = useState("");

  let data =
    tags?.map((tag: string, index: number) => {
      return {
        key: index.toString(),
        tag: tag,
      };
    }) || [];

  const handleDeleteTag = (rowKey: string) => {
    const newTagList = tags.filter((_, index) => index.toString() !== rowKey);
    setTags(newTagList);
  };

  const renderHiddenItem = (data: any, rowMap: any) => {
    return (
      <View className="items-center bg-red-500 flex-1 flex-row justify-between px-4 py-[1px]">
        <TouchableOpacity onPress={() => handleDeleteTag(data.item.key)} testID={`delete-action-${data.item.key}`}>
          <Ionicons name="trash-outline" size={24} color="#111111" style={{ alignSelf: "center" }} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: { key: string; tag: string } }) => (
    <TouchableOpacity activeOpacity={1} className="items-center bg-white flex-1 flex-row justify-center py-[1px]">
      <Text className="font-inter text-lg font-medium">{item.tag}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-2.5 min-h-[100px]">
      <TextInput
        testID="tag-input"
        className="rounded-[30px] h-10 w-full border-b-2 bg-white justify-center text-center text-lg font-medium"
        value={inputText}
        onChangeText={setInputText}
        placeholder="Your Tag Here"
        onSubmitEditing={() => {
          if (inputText !== "") {
            setTags([...tags, inputText]);
            setInputText("");
          }
        }}
      />
      <SwipeListView
        testID="swipe-list"
        data={data}
        scrollEnabled={false}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        keyExtractor={(item) => item.key}
        leftActivationValue={160}
        rightActivationValue={-160}
        leftOpenValue={75}
        rightOpenValue={-75}
        stopLeftSwipe={175}
        stopRightSwipe={-175}
        onRowOpen={(rowKey) => handleDeleteTag(rowKey)}
      />
    </View>
  );
}

export default TagWindow;
