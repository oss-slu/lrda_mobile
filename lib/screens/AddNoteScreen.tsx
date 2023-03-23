import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Note, RootStackParamList } from '../../types';
import PhotoScroller from '../components/photoScroller';

type AddNoteScreenProps = {
  navigation: any;
  route: any;
};

const AddNoteScreen: React.FC<AddNoteScreenProps> = ({ navigation, route }) => {
  const [text, setText] = useState('');
  
  const createNote = async (note: Note) => {
    const response = await fetch("http://lived-religion-dev.rerum.io/deer-lr/create", {
      method: "POST",
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(note.text)
    });
    
    const obj = await response.json();
    console.log(obj.type);
    return obj["@id"];
  };
  
  const saveNote = async () => {
    try {
      const note: Note = { id: '', text };
      const id = await createNote(note);
      note.id = id;
  
      if (route.params?.onSave) {
        route.params.onSave(note);
      }
      navigation.goBack();
    } catch (error) {
      console.error("An error occurred while creating the note:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Add a note..."
        onChangeText={(text) => setText(text)}
        value={text}
      />
      <PhotoScroller/>
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
