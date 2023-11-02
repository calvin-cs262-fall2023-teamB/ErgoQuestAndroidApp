import React, {useState} from 'react';
import {
  TouchableOpacity,
  Button,
  PermissionsAndroid,
  View,
  Text,
  TextInput,
  Pressable,
} from 'react-native';
import base64 from 'react-native-base64';
import CheckBox from '@react-native-community/checkbox';
import {BleManager, Device} from 'react-native-ble-plx';
import { globalStyles } from '../styles/global';
import {LogBox} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-ionicons';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

const BLTManager = new BleManager();

//UUIDs
const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
const BOX_UUID = 'f27b53ad-c63d-49a0-8c0f-9f297e6cc520';
const LOCATION_UUID = 'a5390fc3-c11e-43b6-b3a3-cfa9dacda542';

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

export default function BLEScanner() {
  //Is a device connected?
  const [isConnected, setIsConnected] = useState(false);

  //What device is connected?
  const [connectedDevice, setConnectedDevice] = useState();

  const [message, setMessage] = useState('Nothing Yet');
  const [boxvalue, setBoxValue] = useState(false);
  const [input, setInput] = useState(''); // State to store the input value

  const setLocation = (text) => {
    // Update the state with the input value
    setInput(text);
  };

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
    if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= 100) {
      sendLocation(inputValue.toString()); // Convert the value to a string before sending
      setInput(''); // Clear the input field after submission
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
  
    const navigation = useNavigation(); // Get the navigation object
  
    const handleRemovePage = () => {
      navigation.pop(); // This will remove the "Settings Page" from the stack.
    };

  return (
    <View>
      <View style={{paddingBottom: 200}}></View>


      {/* Title */}
      <View style={globalStyles.rowView}>
        <Text style={globalStyles.titleText}>BLE Example</Text>
      </View>

      <View style={{ position: 'absolute', top: -10, right: 20 }}>
        <TouchableOpacity onPress={handleRemovePage}>
          <View style={{ backgroundColor: 'red', borderRadius: 20, padding: 10 }}>
            <Icon name="ios-close" size={30} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{paddingBottom: 20}}></View>


      {/* Connect Button */}
      <View style={globalStyles.rowView}>
        <TouchableOpacity style={{width: 120}}>
          {!isConnected ? (
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


      <View style={{paddingBottom: 20}}></View>


      {/* Monitored Value */}
      <View style={globalStyles.rowView}>
        <Text style={globalStyles.baseText}>{message}</Text>
      </View>


      <View style={{paddingBottom: 20}}></View>


      {/* Checkboxes */}
      <View style={globalStyles.rowView}>
        <CheckBox
          disabled={false}
          value={boxvalue}
          onValueChange={newValue => {
            // setBoxValue(newValue);
            sendBoxValue(BoolToString(newValue));
          }}
        />
      </View>


    <View style={globalStyles.container}>
      <TextInput
        style={globalStyles.input}
        keyboardType="numeric"
        placeholder="Enter a number between 0 and 100"
        value={input}
        onChangeText={(text) => setLocation(text)}
      />
    </View>


    <View>
      <Button title="Submit" onPress={handleInputSubmit} />
    </View>
  </View>
  );
}