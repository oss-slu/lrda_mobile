import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import { appTheme } from '../components/colors';
import { useDispatch } from 'react-redux';
import { themeReducer } from '../../redux/slice/ThemeSlice';
import { ColorPicker } from 'react-native-color-picker';

function AppThemeSelectorScreen() {

    const dispatch = useDispatch();
    const { theme, updateThemeColor } = useTheme();
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [selectedColor, setSelectedColor] = useState(theme.homeColor);

    const handleConfirmColor = () => {
        updateThemeColor(selectedColor);              // Context
        dispatch(themeReducer(selectedColor));        // Redux
        setColorPickerVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.currentThemeTxt, { color: 'green' }]}>Current Theme</Text>
            {/** Theme Box */}
            <View style={[
                    styles.themeContainer,
                    {
                        backgroundColor: theme.homeColor,
                        height: 40,
                        width: 80,
                        borderRadius: 30,
                    },
                ]}
            />

            <View style={styles.ThemeSection}>
                {
                    appTheme.map((theme, key) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => {
                                dispatch(themeReducer(theme.themeColor))
                            }}
                        >
                            <View style={[styles.themeContainer, { backgroundColor: theme.themeColor, }]}></View>
                        </TouchableOpacity>
                    ))
                }
                <TouchableOpacity onPress={() => setColorPickerVisible(true)}>
                    <View style={[styles.themeContainer, { backgroundColor: '#a3a3a3', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ fontSize: 35, }}>+</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Modal
                visible={colorPickerVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setColorPickerVisible(false)}
            >
                <View style={styles.colorPickerContainer}>
                    <Text style={styles.modalTitle}>Pick a Color</Text>
                    <ColorPicker
                        onColorChange={setSelectedColor}
                        style={styles.colorWheel}
                    />

                    <TouchableOpacity onPress={handleConfirmColor} style={styles.confirmButton}>
                        <Text style={styles.buttonText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setColorPickerVisible(false)}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
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
    modalTitle: {
        fontSize: 20,
        marginBottom: 20
    },
    colorWheel: {
        width: '90%',
        height: 300
    },
    colorPicker: {
        width: '90%',
        height: 30,
    },
    closeButton: {
        width: '90%',
        backgroundColor: '#ccc',
        marginTop: 20,
        borderRadius: 5,
    },
    closeButtonText: {
        fontSize: 15,
        color: '#333',
    },
    selectedColorPreview: {
        height: 50,
        width: 50,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    confirmButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },
});
