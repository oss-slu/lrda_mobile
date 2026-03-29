import { Redirect } from "expo-router";

// This route exists only to occupy a tab slot for the custom AddNoteBtnComponent.
// If somehow navigated to directly, redirect to home.
export default function AddNoteTab() {
  return <Redirect href="/(tabs)" />;
}
