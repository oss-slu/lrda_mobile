import React from 'react'
import { TouchableOpacity } from 'react-native'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SvgIcon } from './SvgIcon'
import IonIcons from 'react-native-vector-icons/Ionicons'
import { useAddNoteContext } from '../context/AddNoteContext'
import { useSelector, useDispatch } from 'react-redux'
import Feather from 'react-native-vector-icons/Feather'
import { toogleAddNoteState } from '../../redux/slice/AddNoteStateSlice'
function AddNoteBtnComponent() {

    const dispatch = useDispatch();

    const {navigateToAddNote, publishNote} = useAddNoteContext();
    const appThemeColor = useSelector((state) => state?.themeSlice?.theme)
    const addNoteState = useSelector((state) => state?.addNoteState?.isAddNoteOpned);
    
    const handleAddNote = () => {
        dispatch(toogleAddNoteState())
        navigateToAddNote();

    }

    const handlePublish = () => {
        publishNote();
    }

  return (
   <View style={[styles.conatiner,]} >
        <SvgIcon style={[styles.backgroung,]}/>
        <TouchableOpacity style={styles.button} onPress={!addNoteState ? handleAddNote : handlePublish}>
            {
                !addNoteState ? 
                (<IonIcons style={styles.buttonIcon} name = 'add' size={25}/>)
                :
                (<Feather style={styles.buttonIcon} name = 'upload-cloud' size={25}/>)
            }
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
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        // Android elevation
        elevation: 5, 
    },
    buttonIcon: {
        fontWeight: '800',
        fontSize: 30
    },
})

export default AddNoteBtnComponent