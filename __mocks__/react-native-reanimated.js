// __mocks__/react-native-reanimated.js
import { Animated } from 'react-native';

export default {
  ...Animated,
  addWhitelistedNativeProps: () => {},
  default: {
    ...Animated,
    addWhitelistedNativeProps: () => {},
    Value: Animated.Value,
    View: Animated.View,
    timing: Animated.timing,
  },
  useSharedValue: () => ({ value: 0 }),
  useAnimatedStyle: () => ({}),
  useAnimatedProps: () => ({}),
  withTiming: (v) => v,
  withSpring: (v) => v,
  withDecay: (v) => v,
};
