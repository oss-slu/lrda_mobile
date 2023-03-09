import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Note, RootStackParamList } from '../../types';
import  generateID  from "../utils/CreateID";

type AddNoteScreenProps = {
  navigation: any;
  route: any;
};

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [text, setText] = useState('');
  let id: number;
  id = generateID();
  let note: Note;

  const saveNote = () => {
    const note = { text , id};
    if (route.params?.onSave) {
      route.params.onSave(note);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a note..."
        onChangeText={(text) => setText(text)}
        value={text}
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  saveButton: {
    backgroundColor: 'lightblue',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddNoteScreen;
