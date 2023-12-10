import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Dimensions, PermissionsAndroid } from 'react-native';
import { NavigationContainer} from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-ionicons';
//import Modal from 'react-native-modal';
import { globalStyles } from './styles/global';
import MoveScreen from './screens/Move';
import PresetsScreen from './screens/Presets';
import TimedScreen from './screens/Timed';
import HelpModal from './screens/HelpModal';
import SettingsModal from './screens/Settings';
//import LoginScreen from './screens/LoginPage';
//import CreateAccountScreen from './screens/createAccountScreen';
import BLEScanner from './screens/BLEScanner';
import base64 from 'react-native-base64';
import {BleManager, Device} from 'react-native-ble-plx';
import {LogBox} from 'react-native';
import './screens/global';

//For Bluetooth -------------------------------------------
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
const BLTManager = new BleManager();
//UUIDs for Bluetooth
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
const BOX_UUID = 'f27b53ad-c63d-49a0-8c0f-9f297e6cc520';
const LOCATION_UUID = 'a5390fc3-c11e-43b6-b3a3-cfa9dacda542';
//---------------------------------------------------------

const { width, height } = Dimensions.get('window');

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

//HomeScreen-------------------------------------------
const  HomeScreen = ({ navigation, changeLocation, callMove }) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const toggleSettingsVisible = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };
  const toggleHelpVisible = () => {
    setIsHelpVisible(!isHelpVisible);
  };

  const handleCallMove = () => {
    callMove();
  }

  const handleChangeLocation = (value) => {
    changeLocation(value);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginTop: -15 }}>
        <TouchableOpacity onPress={toggleHelpVisible}>
          <Icon name="ios-help-circle" size={36} color="black" />
        </TouchableOpacity>
        <Image source={require('./assets/StolenLogo_ErgoQuest.png')} />
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Icon name="ios-cog" size={36} color="black" />
        </TouchableOpacity>
      </View>
      <Tab.Navigator tabBarPosition="bottom">
        <Tab.Screen
          name="Move"
          style={globalStyles.general}
          options={{
            tabBarLabel: 'Move',
            tabBarIcon: () => <Icon name="ios-move" size={24} color="black" />,
          }}
        >
          {(props) => (
            <MoveScreen 
              {...props} 
              changeLocation={handleChangeLocation}
              callMove={handleCallMove} 
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Presets"
          component={PresetsScreen}
          callMove={this.callMove}
          style={globalStyles.general}
          options={{
            tabBarLabel: 'Presets',
            tabBarIcon: () => <Icon name="ios-create" size={24} color="black" />,
          }}
        />
        <Tab.Screen
          name="Timed"
          component={TimedScreen}
          style={globalStyles.general}
          options={{
            tabBarLabel: 'Timed',
            tabBarIcon: () => <Icon name="ios-time" size={24} color="black" />,
          }}
        />
      </Tab.Navigator>
      <HelpModal isVisible={isHelpVisible} onClose={toggleHelpVisible} />
    </SafeAreaView>
  );
}

HomeScreen;

//Bluetooth functions-------------
function StringToBool(input) {
  if (input == '1') {
    return true;
  } else {
    return false;
  }
}

function BoolToString(input) {
  if (input == true) {
    return '1';
  } else {
    return '0';
  }
}
//-------------------------------

export default function App() {
  //Is a device connected?
  const [isConnected, setIsConnected] = useState(false);

  //What device is connected?
  const [connectedDevice, setConnectedDevice] = useState();

  const [message, setMessage] = useState('Nothing Yet');
  const [boxvalue, setBoxValue] = useState(false);
  const [input, setInput] = useState(''); // State to store the input value
  const [id, setID] = useState(''); // State to store the ID value

  useEffect(() => {
    let trade = 1;
    // Polling global.moves[currentMoveIndex].percent every 500 milliseconds
    const intervalId = setInterval(() => {
      if(trade==1){
        percent = global.moves[0].percent;
        setID(0);
        setLocation(percent);
        trade = 0;
      }else{
        percent = global.moves[1].percent;
        setID(1);
        setLocation(percent);
        trade = 1;
      }
    }, 500);
    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  });

  const setLocation = (text) => {
    // Update the state with the input value
    setInput(text);
    handleInputSubmit();
  };

  const connectBluetooth = () => {
    scanDevices();
  }

  const disconnectBluetooth = () => {
    disconnectDevice();
  }

  // Scans available BLT Devices and then call connectDevice
  async function scanDevices() {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permission Localisation Bluetooth',
        message: 'Requirement for Bluetooth',
        buttonNeutral: 'Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ).then(answere => {
      console.log('scanning');
      // display the Activityindicator

      BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn(error);
        }

        if (scannedDevice && scannedDevice.name == 'BLEExample') {
          BLTManager.stopDeviceScan();
          connectDevice(scannedDevice);
        }
      });

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        BLTManager.stopDeviceScan();
      }, 5000);
    });
  }

  // handle the device disconnection (poorly)
  async function disconnectDevice() {
    console.log('Disconnecting start');

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction('messagetransaction');
        BLTManager.cancelTransaction('nightmodetransaction');

        BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
          console.log('DC completed'),
        );
      }

      const connectionStatus = await connectedDevice.isConnected();
      if (!connectionStatus) {
        setIsConnected(false);
      }
    }
  }

  //Function to send data to ESP32
  async function sendBoxValue(value) {
    BLTManager.writeCharacteristicWithResponseForDevice(
      connectedDevice?.id,
      SERVICE_UUID,
      BOX_UUID,
      base64.encode(value),
    ).then(characteristic => {
      console.log('Boxvalue changed to :', base64.decode(characteristic.value));
    });
  }
  async function sendLocation(value) {
    BLTManager.writeCharacteristicWithoutResponseForDevice(
      connectedDevice?.id,
      SERVICE_UUID,
      LOCATION_UUID,
      base64.encode(value)
    )
  }
 
  const handleInputSubmit = () => {
    // Validate the input to be a number between 0 and 100
    const inputValue = parseInt(input, 10);
    const IDValue = parseInt(id, 10);
    if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= 100) {
      sendLocation(IDValue.toString() + " " + inputValue.toString()); // Convert the value to a string before sending
      //setInput(''); // Clear the input field after submission
    } else {
      // Handle invalid input
      console.log('Invalid input. Please enter a number between 0 and 100.');
    }
  };

  //Connect the device and start monitoring characteristics
  async function connectDevice(device) {
    console.log('connecting to Device:', device.name);


    device
      .connect()
      .then(device => {
        setConnectedDevice(device);
        setIsConnected(true);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        //  Set what to do when DC is detected
        BLTManager.onDeviceDisconnected(device.id, (error, device) => {
          console.log('Device DC');
          setIsConnected(false);
        });

        //Read inital values
        //Message
        device
          .readCharacteristicForService(SERVICE_UUID, MESSAGE_UUID)
          .then(valenc => {
            setMessage(base64.decode(valenc?.value));
          });

        //BoxValue
        device
          .readCharacteristicForService(SERVICE_UUID, BOX_UUID)
          .then(valenc => {
            setBoxValue(StringToBool(base64.decode(valenc?.value)));
          });

        //monitor values and tell what to do when receiving an update
        //Message
        device.monitorCharacteristicForService(
          SERVICE_UUID,
          MESSAGE_UUID,
          (error, characteristic) => {
            if (characteristic?.value != null) {
              setMessage(base64.decode(characteristic?.value));
              console.log(
                'Message update received: ',
                base64.decode(characteristic?.value),
              );
            }
          },
          'messagetransaction',
        );

        //BoxValue
        device.monitorCharacteristicForService(
          SERVICE_UUID,
          BOX_UUID,
          (error, characteristic) => {
            if (characteristic?.value != null) {
              setBoxValue(StringToBool(base64.decode(characteristic?.value)));
              console.log(
                'Box Value update received: ',
                base64.decode(characteristic?.value),
              );
            }
          },
          'boxtransaction',
        );

        console.log('Connection established');
      });
    }

  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen 
              {...props} 
              changeLocation={setLocation}
              callMove={handleInputSubmit}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {(props) => (
            <SettingsModal 
              {...props} 
              connect={connectBluetooth}
              disconnect={disconnectBluetooth}
              connected={isConnected}
            />
          )}
        </Stack.Screen>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}