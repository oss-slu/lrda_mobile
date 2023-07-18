import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { Ionicons } from "@expo/vector-icons";

function tagWindow(tags: string[]) {
  let data = tags.map((tag: string, index: number) => {
    return {
      key: index,
      tag: tag,
    };
  });
  const renderHidden = (data: any) => {
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity></TouchableOpacity>
        <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
          <Ionicons name="trash-outline" size={24} color="#111111" />
        </View>
      </View>
    );
  };
  const renderText = (data: any) => {
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity></TouchableOpacity>
        <View style={[styles.backRightBtn, styles.backRightBtnRight]}>
          <Ionicons name="trash-outline" size={24} color="#111111" />
        </View>
      </View>
    );
  };
  return (
    <SwipeListView
      data={data}
      renderItem={renderText}
      renderHiddenItem={renderHidden}
    />
  );
}

const styles = StyleSheet.create({
  backRightBtn: {
    alignItems: "flex-end",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
    paddingRight: 17,
  },
  backRightBtnLeft: {
    backgroundColor: "#1f65ff",
    right: 50,
  },
  backRightBtnRight: {
    backgroundColor: "red",
    width: "52%",
    right: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#C7EBB3",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    margin: 5,
    marginBottom: 15,
    borderRadius: 20,
  },
});
