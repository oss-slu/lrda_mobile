import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { defaultTextFont } from '../../styles/globalStyles';

const Greeting: React.FC = () => {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const determineGreeting = () => {
      const currentHour = new Date().getHours(); // Get the current hour (0-23)

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

    determineGreeting(); // Call the function to set the initial greeting
  }, []); // Empty dependency array ensures it runs once when the component mounts

  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>{greeting},</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    ...defaultTextFont,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Greeting;
