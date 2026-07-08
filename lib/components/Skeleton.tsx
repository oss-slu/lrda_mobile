import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, StyleProp } from "react-native";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// Pulsing placeholder block used while content loads.
export default function Skeleton({ width = "100%", height = 12, borderRadius = 4, color = "#e1e4e8", style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const isTest = !!process.env.JEST_WORKER_ID;

  useEffect(() => {
    if (isTest) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, isTest]);

  return <Animated.View style={[{ width, height, borderRadius, backgroundColor: color, opacity }, style]} />;
}
