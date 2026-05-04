import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TooltipContentProps {
  message: string;
  onPressOk: () => void;
  onSkip: () => void;
}

const TooltipContent = ({ message, onPressOk, onSkip }: TooltipContentProps) => {
  return (
    <View className="bg-surface min-w-[200px] items-center">
      <TouchableOpacity className="absolute top-[5px] right-2" onPress={onSkip}>
        <Text className="text-accent font-bold text-[13px]">Skip Tutorial</Text>
      </TouchableOpacity>

      <Text className="text-base font-semibold mt-10 mb-[30px] text-center text-foreground">{message}</Text>

      <TouchableOpacity className="mt-2.5 bg-accent py-1.5 px-3 rounded-md" onPress={onPressOk}>
        <Text className="text-white text-base font-semibold">Okay</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TooltipContent;
