import React, { useState, useEffect } from "react";
import { Text, View } from "react-native";

const Greeting: React.FC = () => {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const determineGreeting = () => {
      const currentHour = new Date().getHours();

      if (currentHour >= 5 && currentHour < 12) {
        setGreeting("Good Morning");
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting("Good Afternoon");
      } else if (currentHour >= 17 && currentHour < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    };

    determineGreeting();
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="font-inter text-[13px] font-semibold">{greeting},</Text>
    </View>
  );
};

export default Greeting;
