import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Button } from 'react-native';
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
  const [actuatorCount, setActuatorCount] = useState(1);

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

  const confirmActuatorCount = () => {
    if (actuatorCount){
      if (actuatorCount >= 1 && actuatorCount <= 7){
        const curr = global.moves.length;
        let newMoves = [];
        // set moves to proper length
        for (let i = 0; i < actuatorCount; i++) {
          if (i < curr){
            newMoves.push(global.moves[i])
          } else {
            newMoves.push({"id": (i + 1), "name": ("Actuator " + (i + 1) + ""), "percent": 0});
          }
        }
        global.moves = newMoves;
        // edit presets to right length
        for (let i = 0; i < global.presets.length; i++){
          let newValues = [];
          for (let j = 0; j < actuatorCount; j++){
            if (j < curr){
              newValues.push(global.presets[i].actuatorValues[j])
            } else {
              newValues.push({"id": (j + 1), "name": ("Actuator " + (j + 1) + ""), "percent": 0});
            }
          }
          global.presets[i].actuatorValues = newValues;
        }
        alert("Success!");
      } else {
        alert("Error, you must have between 1 and 7 actuators.");
      }
    } else {
      alert("Error, cannot leave field blank.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginTop: 20, width: '100%' }}>
      <TouchableOpacity onPress={handleRemovePage} style={{ position: 'absolute', top: 20, right: 20 }}>
        <View style={{ backgroundColor: 'red', borderRadius: 20, padding: 10 }}>
          <Icon name="ios-close" size={48} color="white" />
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

    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <TextInput
            keyboardType = 'numeric'
            style={{ fontSize: 24, color: 'black', fontWeight: 'bold', borderRadius: 50, borderWidth: 2, borderColor: 'black', textAlign: "center" }}
            value={actuatorCount}
            onChangeText={setActuatorCount}
            placeholder="Actuators (1-7)"
          />
        <TouchableOpacity onPress={confirmActuatorCount} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Set number of actuators</Text>
        </TouchableOpacity>
      </View>
  </SafeAreaView>
  );
}

export default SettingsModal;