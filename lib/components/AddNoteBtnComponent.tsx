import React from 'react'
import { TouchableOpacity } from 'react-native'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SvgIcon } from './SvgIcon'
import IonIcons from 'react-native-vector-icons/Ionicons'
import { useAddNoteContext } from '../context/AddNoteContext'
import { useSelector, useDispatch } from 'react-redux'
import Feather from 'react-native-vector-icons/Feather'
import { toogleAddNoteState } from '../../redux/slice/AddNoteStateSlice'
import { useTheme } from './ThemeProvider'
import { useNavigationState } from '@react-navigation/native'

function AddNoteBtnComponent() {

    const dispatch = useDispatch();

    const {navigateToAddNote, publishNote} = useAddNoteContext();
    const { theme, isDarkmode } = useTheme();
    const appThemeColor = useSelector((state) => state.themeSlice.theme);
    const addNoteState = useSelector((state) => state?.addNoteState?.isAddNoteOpned);
  const currentRouteName = useNavigationState((state) => state.routes[state.index].name);
  const isHomeScreen = currentRouteName === "Home";

  const isAddButtonMode = isHomeScreen || !addNoteState;
    
    const handleAddNote = () => {
        dispatch(toogleAddNoteState())
        navigateToAddNote();

    }

    const handlePublish = () => {
        publishNote();
    }

  return (
   <View style={[styles.conatiner,]} >
        <SvgIcon style={[styles.backgroung, {width:60}]}/>
        <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.primaryColor, // ⬅️ Apply theme color
            shadowColor: isDarkmode ? '#fff' : '#000', // ⬅️ Dynamically set shadow color
          } 
        ]}
        onPress={isAddButtonMode ? handleAddNote : handlePublish}
      >
           {isAddButtonMode ? (
   <IonIcons
   name="add"
   size={25}
   style={[styles.buttonIcon, { color: appThemeColor }]}
 />
 
  ) : (
    <Feather
    name="upload-cloud"
    size={25}
    style={[styles.buttonIcon, { color: appThemeColor }]}
  />
  
  )}
      </TouchableOpacity>
      <Text style={[styles.label, { color: appThemeColor || 'gray' }]}>
  {isAddButtonMode ? 'Add' : 'Publish'}
</Text>

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
        backgroundColor: 'transparent',
        bottom:-35,
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], // Scale width inward
    },
    button: {
        backgroundColor: '#f0f0f0',
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        top: -25,
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        // Android elevation
        elevation: 4, 
    },
    buttonIcon: {
        fontWeight: '800',
        fontSize: 30
    },
    label: {
        fontSize: 12,
        color: 'grey',
        marginTop: -13 // Adds space between button and label
      },
})

export default AddNoteBtnComponent