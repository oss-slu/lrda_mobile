import React from 'react'
import { TouchableOpacity } from 'react-native'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SvgIcon } from './SvgIcon'
import IonIcons from 'react-native-vector-icons/Ionicons'
import { useAddNoteContext } from '../context/AddNoteContext'

function AddNoteBtnComponent() {

    const {navigateToAddNote} = useAddNoteContext();

    const handleAddNote = () => {
        
        console.log("AddtoNotePressed")
        navigateToAddNote();
    }

  return (
   <View style={styles.conatiner} >
        <SvgIcon style={styles.backgroung}/>
        <TouchableOpacity style={styles.button} onPress={handleAddNote}>
            <IonIcons style={styles.buttonIcon} name = 'add' size={25}/>
        </TouchableOpacity>
   </View>
  )
}


const styles = StyleSheet.create({
    conatiner: {
        position: 'relative',
        width: 75,
        alignItems: 'center'
    },
    backgroung:{
        position: 'absolute',
        backgroundColor: 'transparent'
    },
    button: {
        backgroundColor: '#f0f0f0',
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        top: -25,
        elevation: 2

    },
    buttonIcon: {
        fontWeight: '800',
        fontSize: 30
    },
})

export default AddNoteBtnComponent