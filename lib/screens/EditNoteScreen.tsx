// EditNoteScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Note } from '../../types';
import PhotoScroller from '../components/photoScroller';

export type EditNoteScreenProps = {
  route: {
    params: {
      note: Note;
      onSave: (note: Note) => void;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const EditNoteScreen: React.FC<EditNoteScreenProps> = ({ route, navigation }) => {
  const { note, onSave } = route.params;
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  //console.log(note);

  const handleSaveNote = () => {
    const updatedNote = { ...note, title, text };
    onSave(updatedNote);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'hidden' }}>
      <TextInput
        style={styles.title}
        value={title}
        onChangeText={setTitle}
      />


      <ScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'hidden' }}>
        <PhotoScroller />
        <View style={styles.inputContainer}>
            <TextInput
            style={styles.input}
            multiline={true}
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
            />
        </View>
      </ScrollView>
      
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    height: 45,
    borderColor: '#111111',
    borderWidth: 1,
    borderRadius: 30,
    marginBottom: 20,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 30,
  },
  input: {
    flex: 1,
    borderColor: '#111111',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 22,
  },
  saveButton: {
    backgroundColor: '#C7EBB3',
    paddingHorizontal: 120,
    padding: 10,
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: 'center',
  },
  saveText: {
    color: '#111111',
    fontWeight: 'bold',
    fontSize: 12,
  },
  inputContainer: {
    height: 400,
    justifyContent: 'space-between',
  },
});

export default EditNoteScreen;
