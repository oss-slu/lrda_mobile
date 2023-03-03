import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const EditNoteScreen = ({ navigation, route }) => {
  const [text, setText] = useState(route.params.note.text);

  const saveNote = () => {
    const updatedNote = { text };
    route.params.onSave(updatedNote);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your note here"
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity style={styles.button} onPress={saveNote}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
});

export default EditNoteScreen;