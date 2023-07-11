import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Image, StyleSheet, View, Switch } from 'react-native';
import { Note } from "../../../types";
import { User } from "../../models/user_class";
import { Media } from "../../models/media_class";


const user = User.getInstance();

type GoogleMapProps = {
  route: any, // substitute any with the actual type if you know it
  updateCounter: any, // substitute any with the actual type if you know it
  user: User,
};


export default function GoogleMap({ route, updateCounter }: GoogleMapProps) {
  const [global, setGlobal] = useState(false);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, [route.params, updateCounter, global]);

  const fetchMessages = async () => {
    let response;
    try {
      const body = global
        ? { type: "message" }
        : { type: "message", creator: user.getId() };

      response = await fetch("http://lived-religion-dev.rerum.io/deer-lr/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      const fetchedNotes: Note[] = data.map((message: any): Note => ({
        id: message["@id"],
        title: message.title || "",
        text: message.BodyText || "",
        time: (message.__rerum.isOverwritten ? new Date(message.__rerum.isOverwritten) : new Date(message.__rerum.createdAt)).toLocaleString("en-US", { timeZone: "America/Chicago" }),
        creator: message.creator || "",
        media: message.media.map((item: any) => new Media({
          uuid: item.uuid,
          type: item.type,
          uri: item.uri,
          thumbnail: item.thumbnail,
        })),
        latitude: message.latitude || "",
        longitude: message.longitude || "",
      }));
      

      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Switch
        style={styles.toggle}
        value={global}
        onValueChange={(newValue) => setGlobal(newValue)}
      />
      <MapView 
        provider={PROVIDER_GOOGLE}
        style={styles.map} 
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {notes.map(note => 
          note.latitude && note.longitude && (
            <Marker
              key={note.id}
              coordinate={{latitude: note.latitude, longitude: note.longitude}}
            >
              <Image source={require("../../components/public/marker.png")} style={{height: 35, width: 35}} />
            </Marker>
          )
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  toggle: {
    position: 'absolute',
    top: 70,
    left: 15,
    zIndex: 1,
  },
});
