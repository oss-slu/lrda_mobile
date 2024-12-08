import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import LoadingImage from './loadingImage'

function NotesComponent({ IsImage, resolvedImageURI, ImageType, textLength, showTime, item, isPublished }) {
    return (
        <View style={styles.notesContainer}>
            <View style={styles.notesContent}>
                {IsImage && resolvedImageURI ? (
                    <View>
                        <LoadingImage
                            imageURI={resolvedImageURI}
                            type={ImageType}
                            isImage={true}
                            height={70}
                            width={100}
                        />
                    </View>
                ) : (
                    <View>
                        <LoadingImage imageURI={""} type={ImageType} isImage={false} height={70}
                            width={100} />
                    </View>
                )}

                <View style={styles.notesTxtContent}>
                    <Text style={styles.noteTitle}>
                        {item.title.length > textLength
                            ? item.title.slice(0, textLength) + "..."
                            : item.title}
                    </Text>

                    <Text style={styles.noteText}>{showTime}</Text>
                </View>
            </View>

        </View>

    )
}

export default NotesComponent;

const styles = StyleSheet.create({
    notesContainer: {
        position: 'relative',
        flexDirection: "row",
        marginHorizontal: 10,
        elevation: 5,
        borderRadius: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 100,
        backgroundColor: 'white',
        marginTop: 15,
    },
    notesContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        marginLeft: 10,
        width: '40%'
    },
    notesTxtContent: {
        marginLeft: 10,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '500'
    },
    noteText: {
        fontSize: 10,
        fontWeight: '500'
    },

})