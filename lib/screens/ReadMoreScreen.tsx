import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useTheme } from '../components/ThemeProvider';
import Feather from 'react-native-vector-icons/Feather';



const { width, height } = Dimensions.get("window");
function ReadMoreScreen({ navigation }) {

    const { theme, isDarkmode } = useTheme();
    const [isContentLoading, setIsContentLoading] = useState(true);


    const handleContentLoading = () => {
        setIsContentLoading(false);
    }
    return (

        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            {/** header content starts here */}
            <View style={[styles.header, { backgroundColor: theme.homeColor }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Feather name={'arrow-left'} size={30} />
                    </TouchableOpacity>
                    <View style={styles.headerHeading}>
                        <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Resource</Text>
                    </View>
                </View>
            </View>

            <WebView
                source={{ uri: 'https://www.slu.edu' }}
                style={{ flex: 1 }}
                javaScriptEnabled={true} // Allow JavaScript
                mediaPlaybackRequiresUserAction={true} // Prevent autoplay of videos
                allowsInlineMediaPlayback={false} // Fullscreen for videos
                domStorageEnabled={true} // Enable localStorage/sessionStorage
                startInLoadingState={true} // Show a spinner while loading
                renderLoading={() => (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <ActivityIndicator size="large" color="#000000" />
                    </View>
                )}
            >
            </WebView>
        </View>
    )
}

export default ReadMoreScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: height * 0.15,
    },
    headerContent: {
        marginTop: '20%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerHeading: {
        marginLeft: 20,
    },
})