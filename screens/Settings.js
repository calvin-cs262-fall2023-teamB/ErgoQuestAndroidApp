import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Button } from 'react-native';
import Icon from 'react-native-ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import { useNavigation } from '@react-navigation/native';
//import { BluetoothModule } from '../components/BluetoothModule';
//import { getIsConnected, disconnectDevice, scanDevices } from '../components/BluetoothModule'; 

//import BLEScanner from './BLEScanner';
//import * as Location from 'expo-location';

const SettingsModal = ({ connect, disconnect, connected }) => {

  //const userData = route?.params?.userData || null;
  const navigation = useNavigation(); // Get the navigation object

  const showAccountInfo = () => {
    if (global.userData) {
      // If userData is available, show an alert with the user's information
      alert(`Name: ${global.userData.name}\nEmail: ${global.userData.email}`);
    } else {
      // If userData is not available, show a different message
      alert("Not logged in.");
    }
  };

  const handleRemovePage = () => {
    navigation.pop(); // This will remove the "Settings Page" from the stack.
  };

  const handleConnect = () => {
    connect();
  };
  const handleDisconnect = () => {
    disconnect();
  };

  const navigateToLogin = () => {
    //setIsSettingsVisible(false); // Close the modal
    navigation.navigate('Login'); // Navigate
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginTop: 20, width: '100%' }}>
      <TouchableOpacity onPress={handleRemovePage} style={{ position: 'absolute', top: 20, right: 20 }}>
        <View style={{ backgroundColor: 'red', borderRadius: 20, padding: 10 }}>
          <Icon name="ios-close" size={30} color="white" />
        </View>
      </TouchableOpacity>
      <View>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Settings Page</Text>
      </View>
    </View>

    <View style={{ marginTop: 200 }}>
      <TouchableOpacity
        onPress={() => {
          connected ? handleDisconnect() : handleConnect();
        }}
        style={{
          backgroundColor: '#43B2D1',
          borderRadius: 20,
          paddingVertical: 10,
          paddingHorizontal: 20,
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold', marginRight: 8 }}>
          {connected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>

    <View style={{ marginTop: 20 }}>
      <TouchableOpacity
        onPress={showAccountInfo}
        style={{
          backgroundColor: '#43B2D1',
          borderRadius: 20,
          paddingVertical: 10,
          paddingHorizontal: 20,
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold', marginRight: 8 }}>Account</Text>
      </TouchableOpacity>
    </View>

    <View style={{ marginTop: 20 }}>
      <TouchableOpacity
        onPress={navigateToLogin}
        style={{
          backgroundColor: '#43B2D1',
          borderRadius: 20,
          paddingVertical: 10,
          paddingHorizontal: 20,
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold', marginRight: 8 }}>Log In</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
  );
}

export default SettingsModal;