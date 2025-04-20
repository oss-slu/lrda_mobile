import React, { useState } from 'react';
import { View, Modal, Text, StyleSheet } from 'react-native';
import { defaultTextFont } from '../../styles/globalStyles';

const LoadingModal = ({ visible }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={{...defaultTextFont}}>Please wait, saving changes to the note</Text>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: "white",
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });

export default LoadingModal;