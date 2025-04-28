import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/ThemeProvider';
import { appTheme } from '../components/colors';
import { useDispatch, UseDispatch } from 'react-redux';
import { themeReducer } from '../../redux/slice/ThemeSlice';
import { defaultTextFont } from '../../styles/globalStyles';

function AppThemeSelectorScreen() {

    const dispatch = useDispatch();
    const { theme, isDarkmode } = useTheme();
    // const [selectedColor, setSelectedColor] = useState('#ff0000'); // Default color
    // const [sliderValue, setSliderValue] = useState(0.5); // Slider value state

    const handleColorSelected = (color) => {
        setSelectedColor(color);
        updateThemeColor(color);
        setColorPickerVisible(false);
    }


    return (
        <View style={styles.container}>

            <Text style={[styles.currentThemeTxt, { color: 'green' }]}>Current Theme</Text>

            {/** Theme Box */}
            <View style={[styles.themeContainer, {
                backgroundColor: theme.homeColor, height: 40,
                width: 80,
                borderRadius: 30,
            }]}></View>

            <View style={styles.ThemeSection}>
                {
                    appTheme.map((theme, key) => (
                        <TouchableOpacity key={key}
                            onPress={() => {
                                dispatch(themeReducer(theme.themeColor))
                            }}
                        >
                            <View style={[styles.themeContainer, { backgroundColor: theme.themeColor, }]}></View>
                        </TouchableOpacity>
                    ))
                }
                {/* <TouchableOpacity>
                    <View style={[styles.themeContainer, { backgroundColor: '#a3a3a3', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ ...defaultTextFont ,fontSize: 35,  }}>+</Text>
                    </View>
                </TouchableOpacity> */}
            </View>



        </View>
    )
}

export default AppThemeSelectorScreen;

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    currentThemeTxt: {
        ...defaultTextFont,
        fontSize: 18,
        fontWeight: '600',
        color: '#999898',
        marginBottom: 10,
    },
    ThemeSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    themeContainer: {
        height: 60,
        width: 60,
        borderRadius: 50,
        marginTop: 20,
        borderWidth: 0.5,
        margin: 10,
    },
    colorPickerContainer: {
        height: 300, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorPicker: {
        width: '100%',
        height: 200,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    selectedColorPreview: {
        height: 50,
        width: 50,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: 20,
    },
});
