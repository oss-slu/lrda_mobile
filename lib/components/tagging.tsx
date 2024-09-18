import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";

function TagWindow({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}) {
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
      <View style={styles.rowBack}>
        <TouchableOpacity
          onPress={() => handleDeleteTag(data.item.key)}
          testID={`delete-action-${data.item.key}`}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#111111"
            style={{ alignSelf: "center" }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: { key: string; tag: string } }) => (
    <TouchableOpacity activeOpacity={1} style={styles.rowFront}>
      <Text style={styles.text}>{item.tag}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ marginBottom: 10, minHeight: 100 }}>
      <TextInput
        testID="tag-input"
        style={styles.textBox}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Your Tag Here"
        onSubmitEditing={() => {
          if (inputText !== '') {
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

const styles = StyleSheet.create({
  rowBack: {
    alignItems: "center",
    backgroundColor: "red",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 1,
  },
  rowFront: {
    alignItems: "center",
    backgroundColor: "white",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 1,
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
  },
  textBox: {
    borderRadius: 30,
    height: 40,
    width: "100%",
    borderBottomWidth: 2,
    backgroundColor: "white",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
  },
});
