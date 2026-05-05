import React from "react";
import { View, Modal, Text } from "react-native";

const LoadingModal = ({ visible }: { visible: boolean }) => (
  <Modal animationType="fade" transparent={true} visible={visible}>
    <View className="flex-1 items-center justify-center bg-black/50">
      <View
        className="m-5 items-center rounded-lg bg-white p-[35px]"
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
