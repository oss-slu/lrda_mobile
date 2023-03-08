import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

import { Note, RootStackParamList } from '../../types';

export type EditNoteScreenProps = {
  route: {
    params: {
      note: Note;
      onSave: (note: Note) => void;
    };
  };
}

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({ route }) => {
  const { note, onSave } = route.params;
  const [text, setText] = useState(note.text);

  // useEffect(() => {
  //   // This effect will be called every time the 'note' prop changes
  //   setText(note.text);
  // }, [note]);

  const handleSaveNote = () => {
    const updatedNote = { ...note, text };
    onSave(updatedNote);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
      />
      <Button title="Save" onPress={handleSaveNote} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
});

export default EditNoteScreen;
