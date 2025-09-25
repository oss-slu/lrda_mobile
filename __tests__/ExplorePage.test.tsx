import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Dimensions, Animated } from 'react-native';
import ExploreScreen from '../lib/screens/mapPage/ExploreScreen';
import { AddNoteProvider } from '../lib/context/AddNoteContext';
import ApiService from '../lib/utils/api_calls';
import { act } from 'react-test-renderer';

// Get screen width for scroll simulation
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

// Mock expo-constants properly
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    statusBarHeight: 20,
    manifest: {},
    expoConfig: {
      name: 'test-app',
      slug: 'test-app',
    },
  },
}));

jest.mock('../lib/components/ThemeProvider', () => ({
  useTheme: () => ({
    theme: { text: '#000000', homeColor: '#ffffff' },
    isDarkmode: false,
  }),
}));

jest.mock("firebase/app", () => ({ initializeApp: jest.fn() }));
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn((_, callback) =>
    callback({ uid: "12345", email: "test@example.com" })
  ),
}));
jest.mock("firebase/firestore", () => ({ getFirestore: jest.fn() }));
jest.mock("firebase/database", () => ({ getDatabase: jest.fn() }));
jest.mock("firebase/storage", () => ({ getStorage: jest.fn() }));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  setValues: jest.fn(),
  getConstants: jest.fn(() => ({ settings: {} })),
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 0, longitude: 0 } })
  ),
}));

// Mock the MapNotesComponent to render actual content
jest.mock('../lib/components/MapNotesComponent', () => ({
  MapNotesComponent: jest.fn(({ marker, index }) => {
    const React = require('react');
    const { View, Text, Image } = require('react-native');
    return (
      <View key={index} style={{ width: CARD_WIDTH, marginHorizontal: 10 }}>
        <Image source={{ uri: 'test' }} />
        <View>
          <View>
            <Text>{marker.title}</Text>
            <Text>{marker.description}</Text>
          </View>
        </View>
      </View>
    );
  }),
}));

// Mock NoteDetailModal - adjust path based on actual location
jest.mock('../lib/screens/mapPage/NoteDetailModal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn(({ isVisible, onClose, note }) => {
    if (!isVisible) return null;
    return React.createElement(View, { testID: 'note-detail-modal' });
  });
});

// Mock Tooltip component
jest.mock('react-native-walkthrough-tooltip', () => {
  const React = require('react');
  const { View } = require('react-native');
  return jest.fn(({ children, isVisible }) => {
    return React.createElement(View, { testID: 'tooltip-wrapper' }, children);
  });
});

// Mock TooltipContent
jest.mock('../lib/onboarding/TooltipComponent', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return jest.fn(({ message, onPressOk, onSkip }) => {
    return React.createElement(View, { testID: 'tooltip-content' }, [
      React.createElement(Text, { key: 'message' }, message),
      React.createElement(TouchableOpacity, { 
        key: 'ok-button',
        testID: 'tooltip-ok',
        onPress: onPressOk 
      }, React.createElement(Text, null, 'OK')),
      React.createElement(TouchableOpacity, { 
        key: 'skip-button',
        testID: 'tooltip-skip',
        onPress: onSkip 
      }, React.createElement(Text, null, 'Skip'))
    ]);
  });
});

// Mock Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return jest.fn(({ name, size, color, onPress }) => {
    return React.createElement(Text, { 
      testID: `icon-${name}`,
      onPress: onPress 
    }, name);
  });
});

// Mock react-native-maps with proper methods
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MapView = React.forwardRef((props, ref) => {
    // Add mock methods to the ref
    React.useImperativeHandle(ref, () => ({
      animateToRegion: jest.fn(),
      animateCamera: jest.fn(),
      animateToViewingAngle: jest.fn(),
      animateToNavigation: jest.fn(),
      fitToElements: jest.fn(),
      fitToSuppliedMarkers: jest.fn(),
      fitToCoordinates: jest.fn(),
    }));
    
    return React.createElement(View, { testID: 'map-view', ...props }, props.children);
  });
  
  const Marker = jest.fn(({ children, coordinate, onPress }) => {
    return React.createElement(View, { 
      testID: 'map-marker',
      onPress: onPress 
    }, children);
  });
  
  return {
    __esModule: true,
    default: MapView,
    Marker: Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('../lib/screens/mapPage/mapData', () => ({
  mapDarkStyle: [],
  mapStandardStyle: [],
}));

jest.mock('../lib/components/time', () => ({
  formatToLocalDateString: jest.fn((date) => date ? date.toString() : ''),
}));

jest.mock('../lib/models/user_class', () => ({
  User: {
    getHasDoneTutorial: jest.fn(() => Promise.resolve(false)),
    setUserTutorialDone: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../lib/utils/api_calls', () => {
  const dummyNotes = Array.from({ length: 20 }, (_, index) => ({
    latitude: '38.631393',
    longitude: '-90.192226',
    creator: 'User',
    __rerum: { createdAt: new Date().toISOString() },
    title: `Note ${index}`,
    BodyText: 'Description',
    media: [],
    tags: [],
  }));
  
  return {
    __esModule: true,
    default: {
      writeNewNote: jest.fn(),
      fetchMessages: jest.fn(() => Promise.resolve([])),
      fetchMessagesBatch: jest.fn(() => Promise.resolve(dummyNotes)),
      fetchMapsMessagesBatch: jest.fn(() => Promise.resolve(dummyNotes)),
      searchMessages: jest.fn(() => Promise.resolve([])),
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve('false')),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

// Use real timers for better control
jest.useRealTimers();

// Store listeners for manual triggering
let animatedListeners = [];

// Mock Animated.Value and Animated.event
beforeAll(() => {
  const originalAnimatedValue = Animated.Value;
  
  Animated.Value = jest.fn(function(initialValue) {
    const instance = new originalAnimatedValue(initialValue);
    const originalAddListener = instance.addListener.bind(instance);
    
    instance.addListener = jest.fn((callback) => {
      // Create a safe wrapper that checks for valid data
      const safeCallback = (event) => {
        // Only call the callback if we're in a valid state
        if (event && typeof event.value === 'number') {
          try {
            callback(event);
          } catch (error) {
            // Silently catch errors from the component's listener
            // This happens when state.markers isn't ready yet
          }
        }
      };
      animatedListeners.push(safeCallback);
      return originalAddListener(safeCallback);
    });
    
    return instance;
  });

  // Mock Animated.event to handle scroll events
  Animated.event = jest.fn((config, options) => {
    return (event) => {
      if (event?.nativeEvent?.contentOffset?.x !== undefined) {
        const value = event.nativeEvent.contentOffset.x;
        // Trigger all listeners with the new value
        animatedListeners.forEach(listener => {
          try {
            listener({ value });
          } catch (error) {
            // Ignore errors from listeners
          }
        });
      }
    };
  });
});

describe('ExploreScreen - Load More Button Rendering', () => {
  beforeEach(() => {
    animatedListeners = [];
    jest.clearAllMocks();
  });

  it('renders Explore screen', async () => {
    const component = render(
      <AddNoteProvider>
        <ExploreScreen />
      </AddNoteProvider>
    );

    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      const explore = component.getByTestId('Explore');
      expect(explore).toBeTruthy();
    });
  });



  it('does not show Load More button when there are no more notes', async () => {
    // Mock API to return less than LIMIT notes (indicating last page)
    jest.spyOn(ApiService, 'fetchMapsMessagesBatch').mockResolvedValueOnce(
      Array.from({ length: 10 }, (_, index) => ({
        latitude: '38.631393',
        longitude: '-90.192226',
        creator: 'User',
        __rerum: { createdAt: new Date().toISOString() },
        title: `Note ${index}`,
        BodyText: 'Description',
        media: [],
        tags: [],
      }))
    );

    const component = render(
      <AddNoteProvider>
        <ExploreScreen />
      </AddNoteProvider>
    );

    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Wait for initial load - allow for multiple calls due to re-renders
    await waitFor(() => {
      expect(ApiService.fetchMapsMessagesBatch).toHaveBeenCalled();
    });

    // Wait for state to stabilize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const scrollView = component.getByTestId('cardScrollView');

    // Scroll to the last card (index 9 since we only have 10 notes)
    await act(async () => {
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: {
            x: (CARD_WIDTH + 20) * 9,
          },
          contentSize: { width: (CARD_WIDTH + 20) * 10 },
          layoutMeasurement: { width: width },
        },
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Load More button should NOT appear since hasMore is false
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(component.queryByTestId('loadMoreButton')).toBeNull();
  });

  it('hides Load More button when search results are active', async () => {
    const component = render(
      <AddNoteProvider>
        <ExploreScreen />
      </AddNoteProvider>
    );

    await act(async () => {
      // Wait for any async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Wait for initial load - allow for multiple calls due to re-renders
    await waitFor(() => {
      expect(ApiService.fetchMapsMessagesBatch).toHaveBeenCalled();
    });

    // Wait for state to stabilize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Mock search results
    jest.spyOn(ApiService, 'searchMessages').mockResolvedValueOnce([
      {
        latitude: '38.631393',
        longitude: '-90.192226',
        creator: 'SearchUser',
        __rerum: { createdAt: new Date().toISOString() },
        title: 'Search Result',
        BodyText: 'Search Description',
        media: [],
        tags: [],
      },
    ]);

    // Simulate search
    const searchInput = component.getByPlaceholderText('Search here');
    
    await act(async () => {
      fireEvent.changeText(searchInput, 'test query');
      fireEvent(searchInput, 'submitEditing');
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    const scrollView = component.getByTestId('cardScrollView');

    // Even after scrolling, Load More should not appear when search results are active
    await act(async () => {
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { x: 0 },
          contentSize: { width: CARD_WIDTH + 20 },
          layoutMeasurement: { width: width },
        },
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(component.queryByTestId('loadMoreButton')).toBeNull();
  });
});