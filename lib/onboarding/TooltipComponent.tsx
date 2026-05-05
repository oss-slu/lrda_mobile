import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TooltipContentProps {
  message: string;
  onPressOk: () => void;
  onSkip: () => void;
}

const TooltipContent = ({ message, onPressOk, onSkip }: TooltipContentProps) => {
  return (
    <View className="min-w-[200px] items-center bg-surface">
      <TouchableOpacity className="absolute right-2 top-[5px]" onPress={onSkip}>
        <Text className="text-[13px] font-bold text-accent">Skip Tutorial</Text>
      </TouchableOpacity>

      <Text className="mb-[30px] mt-10 text-center text-base font-semibold text-foreground">{message}</Text>

      <TouchableOpacity className="mt-2.5 rounded-md bg-accent px-3 py-1.5" onPress={onPressOk}>
        <Text className="text-base font-semibold text-white">Okay</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TooltipContent;
