import { Platform, StyleSheet } from "react-native";
import { lightTheme, darkTheme } from "../colors";
import Constants from "expo-constants";
import { useTheme } from "../../lib/components/ThemeProvider";

// Define custom CSS as a separate string
// In NotePageStyles.ts
export const customImageCSS = `
  .ProseMirror img {
    max-width: 200px !important;
    max-height: 200px !important;
    object-fit: cover !important;
    display: inline-block; /* Ensure images don't expand to fit container width */
  }
`;



const NotePageStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    topContainer: {
      minHeight: 140,
    },
    topButtonsContainer: {
      justifyContent: "space-between",
      paddingHorizontal: 5,
      paddingTop: Constants.statusBarHeight,
      flexDirection: "row",
      backgroundColor: theme.primaryColor,
      alignItems: "center",
      textAlign: "center",
    },
    topText: {
      maxWidth: "100%",
      fontWeight: "700",
      fontSize: 32,
      textAlign: "center",
      color: theme.text,
    },
    topButtons: {
      backgroundColor: theme.tertiaryColor,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99,
    },
    container: {
      backgroundColor: theme.tertiaryColor,
      marginBottom: 4,
      width: "100%",
    },
    editorContainer: {
      marginBottom: 1,
      width: "100%",
      backgroundColor: theme.primaryColor, // Ensure it matches the overall theme
      ...Platform.select({
        android: {
          marginBottom: 1,
          backgroundColor: theme.primaryColor,
          width: "100%",
        },
      }),
    },
    editor: {
      backgroundColor: theme.tertiaryColor,
      marginBottom: 4,
      width: "100%",
      minHeight: 200, // Adjust for better visibility
      color: theme.text,
      padding: 10,
      ...Platform.select({  // Adjust for better visibility
        android: {
          backgroundColor: theme.primaryColor,
          color: theme.text,
          marginBottom: 4,
          width: "100%",
          minHeight: 200,
          padding: 10,
        },
      }),
    },

   // Define this image style
   editorImage: {
    width: 50,
    height: 50,
    resizeMode: 'cover', // Ensures the image keeps its aspect ratio
  },

    textEditorContainer: {
      minHeight: 300, // Set a minimum height for the editor
      flex: 1, // Ensure the editor takes up available space
    },
    title: {
      height: 45,
      width: "70%",
      borderColor: theme.text,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 10,
      textAlign: "center",
      fontSize: 24, // Slightly smaller than 30 for better mobile readability
      color: theme.text,
    },
    input: {
      backgroundColor: 'white',
      fontSize: 22,
      color: theme.text,
      height: 900, 
    },
    addButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: theme.secondaryColor,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    keyContainer: {
      paddingVertical: 5,
      width: "100%",
      backgroundColor: theme.primaryColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 40,
    },
    saveText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 14,
    },
    video: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignSelf: "center",
    },

    //editor styles
    richTextContainer: {
      height: Platform.OS == "android"? "90%" : "100%" 
    },
    //tool bar styles
    toolbar: {
      height: 40, // Fixed height for the toolbar at the bottom
      backgroundColor: '#333', // Ensure the toolbar has a background color
  
      ...Platform.select({
        android: {
          height: 70, // Fixed height for the toolbar at the bottom
          backgroundColor: theme.primaryColor, // Ensure the toolbar has a background color
          overflow: 'hidden', // Ensure no extra space
          marginTop: 50
        },
        ios: {
          height: 50, // Fixed height for the toolbar at the bottom
          backgroundColor: theme.primaryColor, 
          overflow: 'hidden', // Ensure no extra space
          marginTop: 50
        },
      }),
    },

    closeKeyboardButton: {
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default NotePageStyles;
