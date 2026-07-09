import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { useEditorBridge } from "@10play/tentap-editor";
import { useTheme } from "../components/ThemeProvider";

const customImageCSS = `
  .ProseMirror img {
    max-width: 200px !important;
    max-height: 200px !important;
    object-fit: cover !important;
    display: inline-block;
  }
`;

export function isBodyEmpty(htmlString: string): boolean {
  return htmlString.replace(/<\/?[^>]+(>|$)/g, "").trim().length === 0;
}

export function useKeyboardVisible() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return keyboardVisible;
}

/**
 * Rich-text editor bridge for the note screens, with theme-aware CSS and
 * helpers for appending media links/tags to the document.
 */
export function useNoteEditor(initialContent: string) {
  const { colors } = useTheme();
  const editor = useEditorBridge({
    initialContent,
    avoidIosKeyboard: true,
  });

  useEffect(() => {
    if (editor) {
      const combinedCSS = `
        ${customImageCSS}
        body {
          color: ${colors.foreground};
        }
      `;
      editor.injectCSS(combinedCSS);
    }
  }, [editor, colors.foreground]);

  const displayErrorInEditor = async (errorMessage: string) => {
    const currentContent = await editor.getHTML();
    const errorTag = `<p style="color: red; font-weight: bold;">${errorMessage}</p><br />`;
    editor.setContent(currentContent + errorTag);
    editor.focus();
  };

  const insertImageToEditor = async (imageUri: string) => {
    try {
      const currentContent = await editor.getHTML();
      const imageTag = `<img src="${imageUri}" style="max-width: 200px; max-height: 200px; object-fit: cover;" /><br />`;
      editor.setContent(currentContent + imageTag);
      editor.focus();
    } catch (error) {
      console.error("Error inserting image:", error);
      displayErrorInEditor(`Error inserting image: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const addVideoToEditor = async (videoUri: string) => {
    try {
      const currentContent = await editor.getHTML();
      const videoLink = `${currentContent}<a href="${videoUri}">${videoUri}</a><br>`;
      editor.setContent(videoLink);
      editor.focus();
    } catch (error) {
      console.error("Error adding video:", error);
      displayErrorInEditor(`Error adding video: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const insertAudioToEditor = async (audioUri: string) => {
    try {
      const currentContent = await editor.getHTML();
      const audioLink = `${currentContent}<a href="${audioUri}">${audioUri}</a><br>`;
      editor.setContent(audioLink);
      editor.focus();
    } catch (error) {
      console.error("Error adding audio:", error);
      displayErrorInEditor(`Error adding audio: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDonePress = () => {
    if (editor?.blur) {
      editor.blur();
    }
    Keyboard.dismiss();
  };

  return { editor, insertImageToEditor, addVideoToEditor, insertAudioToEditor, handleDonePress };
}
