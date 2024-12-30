import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import navigationReducer from '../slice/navigationSlice';
import ThemeSlice from '../slice/ThemeSlice';
import AddNoteStateSlice from '../slice/AddNoteStateSlice';

// Persist Config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage, // Use AsyncStorage for React Native
  blacklist: ['register'], // Exclude the "register" key from persistence
};

// Combine Reducers
const rootReducer = combineReducers({
  navigation: navigationReducer,
  themeSlice: ThemeSlice,
  addNoteState: AddNoteStateSlice,
});

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // Ignore persistence actions
        ignoredPaths: ['register'], // Ignore non-serializable state in "register"
      },
    }),
});

// Create persistor to persist store
export const persistor = persistStore(store);

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;

// Define AppDispatch type
export type AppDispatch = typeof store.dispatch;
