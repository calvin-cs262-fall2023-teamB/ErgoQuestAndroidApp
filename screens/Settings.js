import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, Button } from 'react-native';
import Icon from 'react-native-ionicons';
import Modal from 'react-native-modal';
import { globalStyles } from '../styles/global';
import { useNavigation } from '@react-navigation/native';
//import { BluetoothModule } from '../components/BluetoothModule';
import { getIsConnected, disconnectDevice, scanDevices } from '../components/BluetoothModule'; 

//import BLEScanner from './BLEScanner';
//import * as Location from 'expo-location';

export default function SettingsModal(){

  const navigation = useNavigation(); // Get the navigation object
  
    const handleRemovePage = () => {
      navigation.pop(); // This will remove the "Settings Page" from the stack.
    };

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginTop: 20 }}>
          <View style={{ position: 'absolute', top: -10, right: 20 }}>
            <TouchableOpacity onPress={handleRemovePage}>
              <View style={{ backgroundColor: 'red', borderRadius: 20, padding: 10 }}>
                <Icon name="ios-close" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ position: 'absolute', top: 0, left: 120 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Settings Page</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', top: 200, left: 55 }}>
          <TouchableOpacity style={{width: 120}}>
            {!getIsConnected ? (
              <Button
                title="Connect"
                onPress={() => {
                  scanDevices();
                }}
                disabled={false}
              />
            ) : (
              <Button
                title="Disconnect"
                onPress={() => {
                  disconnectDevice();
                }}
                disabled={false}
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={{ position: 'absolute', top: 300, left: 150 }}>
            <TouchableOpacity onPress={() => alert("Account Information")} style={{ backgroundColor: '#43B2D1', borderRadius: 20, padding: 10 }}>
              <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>Account</Text>
            </TouchableOpacity>
            </View>
      </SafeAreaView>
    );
  }
