import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, FlatList, StatusBar } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import Feather from 'react-native-vector-icons/Feather';
import { bibiloText } from '../data';

const { width, height } = Dimensions.get("window");

const renderList = (data, navigation) => (
    <View style={styles.eachBibiloComponent}>
        <Text>{data.item.bibiloText}</Text>
        <View style={styles.readMoreContainer}>
            <TouchableOpacity onPress={() => { navigation.navigate('ReadMore') }}>
                <Text style={styles.readMoreLink}>Read more</Text>
            </TouchableOpacity>
        </View>
    </View>
)
function ResourceScreen({ navigation }) {
    const { theme } = useTheme();
    console.log(theme)
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
            {/** header content ends here */}

            <View style={styles.mainContent}>
                {/* <Text style={styles.bibilographyTxt}>Bibilography</Text> */}
                <FlatList
                    data={bibiloText}
                    renderItem={(data) => renderList(data, navigation)}
                    contentContainerStyle={{ paddingBottom: 300 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    )
}

export default ResourceScreen;

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
    mainContent: {
        padding: 10,
    },
    bibilographyTxt: {
        fontSize: 15,
        fontWeight: '600',

    },
    //FlatList View style here
    eachBibiloComponent: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000', // Shadow color
        shadowOffset: { width: 0, height: 2 }, // Position of the shadow
        shadowOpacity: 0.25, // Opacity of the shadow (0 to 1)
        shadowRadius: 4, // How much the shadow spreads,
        width: width * 0.9,
        alignSelf: 'center',

    },
    readMoreContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 20,
    },
    readMoreLink: {
        color: '#0e0ec6'
    }
})