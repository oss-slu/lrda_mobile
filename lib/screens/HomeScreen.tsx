import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

interface Note {
  id: number;
  title: string;
  text: string;
}

export type HomeScreenProps = {
  navigation: any;
  route: { params?: { note: Note; onSave: (note: Note) => void } };
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (route.params?.note) {
      setNotes([...notes, route.params.note]);
    }
  }, [route.params]);

  const addNote = (note: Note) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  const updateNote = (note: Note) => {
    setNotes((prevNotes) =>
      prevNotes.map((prevNote) => (prevNote.id === note.id ? note : prevNote))
    );
  };

  const deleteNote = (id: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const renderItem = ({ item }: { item: Note }) => {
    return (
        <TouchableOpacity style={styles.noteContainer}
          onPress={() =>
            navigation.navigate('EditNote', { note: item, onSave: updateNote })
          }
        >
          <Text style={styles.noteText}>{item.title}</Text>
          <TouchableOpacity onPress={() => deleteNote(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#111111" />
          </TouchableOpacity>
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name='menu-outline' size={24} color="white" />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image style={styles.pfp} source={require("../components/public/izak.png")} />
        <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: "600", }}>Hi, Izak</Text>
      </View>

      <Text style={styles.title}>My{"\n"}Notes</Text>
      <ScrollView style={styles.filtersContainer} 
      horizontal={true} 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 20 }}>
          <View style={styles.filtersSelected}><Text style= {styles.selectedFont}>All ({notes.length})</Text></View>
          <View style={styles.filters}><Text style={styles.filterFont} >Nearest</Text></View>
          <View style={styles.filters}><Text style={styles.filterFont} >St. Louis</Text></View>
          <View style={styles.filters}><Text style={styles.filterFont} >Alphabetical</Text></View>
          <View style={styles.filters}><Text style={styles.filterFont} >Most Recent</Text></View>
      </ScrollView>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes yet!</Text>
          </View>
        )}
      />
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddNote', { onSave: addNote })}
      >
        <Ionicons name="add-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 22,
    fontSize: 28,
    color: '#bbb',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#111111',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    backgroundColor: '#111111',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: 355, 
    padding: 20,
    paddingHorizontal: 35,
    flexDirection: 'row',
  },
  filtersContainer: {
    //justifyContent: 'center',
    //alignItems: 'center',
    minHeight: 30,
    alignSelf: 'center',
    borderRadius: 20,
    paddingHorizontal: 20,
    maxHeight: 30,
    marginBottom: 17,
  },
  filters: {
    justifyContent: 'center',
    borderColor: '#F4DFCD',
    borderWidth: 2,
    borderRadius: 30,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  filtersSelected: {
    justifyContent: 'center',
    backgroundColor: '#C7EBB3',
    fontSize: 22,
    borderRadius: 30,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  selectedFont: {
    fontSize: 17,
    color: '#111111',
    fontWeight: '700',
  },
  filterFont:{
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    lineHeight: 80,
    color: '#111111',
    marginBottom: 10,
  },
  pfp: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginLeft: 3,
    marginTop: 3,
  }
});

export default HomeScreen;
