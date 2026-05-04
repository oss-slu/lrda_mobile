import React from "react";
import { View, Modal, Text } from "react-native";

const LoadingModal = ({ visible }: { visible: boolean }) => (
  <Modal animationType="fade" transparent={true} visible={visible}>
    <View className="flex-1 justify-center items-center bg-black/50">
      <View
        className="m-5 bg-white rounded-lg p-[35px] items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text className="font-inter">Please wait, saving changes to the note</Text>
      </View>
    </View>
  </Modal>
);

export default LoadingModal;
