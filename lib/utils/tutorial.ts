import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getHasDoneTutorial(page: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(page);
    return value !== null ? JSON.parse(value) : false;
  } catch {
    return false;
  }
}

export async function setTutorialDone(page: string, done: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(page, JSON.stringify(done));
  } catch (error) {
    console.error("Error saving tutorial state:", error);
  }
}
