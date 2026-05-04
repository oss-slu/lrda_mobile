import AsyncStorage from "@react-native-async-storage/async-storage";

export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log("Error storing value: ", error);
  }
};

export const getItem = async (key: string): Promise<string | null | undefined> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.log("Error retrieving value: ", error);
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log("Error deleting value: ", error);
  }
};

export const saveString = async (key: string, value: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const save = async (key: string, value: unknown): Promise<boolean> => saveString(key, JSON.stringify(value));

export const get = async <T = unknown>(key: string): Promise<T | null> => {
  try {
    const itemString = await AsyncStorage.getItem(key);
    if (itemString) {
      return JSON.parse(itemString) as T;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

export default {
  saveString,
  save,
  get,
};
