import React, { useState, useRef } from "react";
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

  let data = tags?.map((tag: string, index: number) => {
    return {
      key: index,
      tag: tag,
    };
  }) || [];

  const handleDeleteTag = (rowKey: string, rowMap: any) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
    const index = data.findIndex((item) => item.key.toString() === rowKey);
    const newTagList = [...tags];
    newTagList.splice(index, 1);
    setTags(newTagList);
  };

  const renderHidden = (data: any, rowMap: any) => {
    return (
      <View key={data.item.key} style={styles.rowBack}>
        <TouchableOpacity
          onPress={() => handleDeleteTag(data.item.key.toString(), rowMap)}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color="#111111"
            style={{ alignSelf: "center" }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTag(data.item.key.toString(), rowMap)}
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

  const updateTag = ({ item }: { item: { key: number; tag: string } }) => {
    const newTagList = [...tags];
    newTagList.splice(item.key, 1);
    setTags(newTagList);
    setInputText(item.tag);
  };

  const renderText = ({ item }: { item: { key: number; tag: string } }) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        key={item.key}
        style={styles.rowFront}
        onPress={() => updateTag({ item })}
      >
        <Text style={styles.text}>{item.tag}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{marginBottom: 10}}>
      <TextInput
        style={styles.textBox}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Your Tag Here"
        onSubmitEditing={() => {
          if(inputText != '')
            if(tags){
              setTags([...tags, inputText]);
            } else{
              setTags([inputText]);
            }
            setInputText("");
        }}        
      />
      <SwipeListView
        data={data}
        scrollEnabled={false}
        renderItem={renderText}
        renderHiddenItem={renderHidden}
        keyExtractor={(item) => item.key.toString()}
        leftActivationValue={160}
        rightActivationValue={-160}
        leftOpenValue={75}
        rightOpenValue={-75}
        stopLeftSwipe={175}
        stopRightSwipe={-175}
        onRightAction={(rowKey, rowMap) => handleDeleteTag(rowKey, rowMap)}
        onLeftAction={(rowKey, rowMap) => handleDeleteTag(rowKey, rowMap)}
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
