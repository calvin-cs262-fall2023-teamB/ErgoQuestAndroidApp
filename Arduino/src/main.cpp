#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <ArduinoJson.h>

StaticJsonDocument<128> jsonDoc;

BLEServer *pServer = NULL;
BLECharacteristic *message_characteristic = NULL;
BLECharacteristic *box_characteristic = NULL;
BLECharacteristic *moving_characteristic = NULL;
BLECharacteristic *direction_characteristic = NULL;

String boxValue = "0";
String movingValue = "0";
String directionValue = "0";

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define MESSAGE_CHARACTERISTIC_UUID "6d68efe5-04b6-4a85-abc4-c2670b7bf7fd"
#define BOX_CHARACTERISTIC_UUID "f27b53ad-c63d-49a0-8c0f-9f297e6cc520"
#define MOVING_UUID "f629121c-d51c-4ca9-b796-38bd6f23708b"
#define DIRECTION_UUID "d59671ce-950f-417c-ac51-d1d1cc8a6df9"

// Define LED pins
const int redLEDPin = 32;   // Red LED is connected to GPIO 25
const int blueLEDPin = 33;  // Blue LED is connected to GPIO 26

// Actuator variables
const int pwmExtendPin = 25;       // PWM pin for extending the actuator
const int pwmRetractPin = 26;      // PWM pin for retracting the actuator
//const int hallEffectPin1 = 34;      // Hall Effect sensor pin
//const int hallEffectPin2 = 35;      // Hall Effect sensor pin
const int pulsePerInch = 3500;     // Pulses per inch of actuator travel
long pos = 0;                       // Actuator position in pulses
long prevPos = 0;                   // Previous position
bool dir = 0;                       // Direction of actuator (0 = Retract, 1 = Extend)
unsigned long prevTimer = 0;  // Time stamp of the last pulse
bool homeFlag = 0;           // Flag to know if the actuator is homed
long steps = 0;              // Pulses from the Hall Effect sensor

// Code used to move the actuator given direction and speed
void driveActuator(int speed, bool direction) {
  analogWrite(pwmExtendPin, direction ? speed : 0);
  analogWrite(pwmRetractPin, direction ? 0 : speed);
}

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    Serial.println("Connected");
  };

  void onDisconnect(BLEServer *pServer)
  {
    Serial.println("Disconnected");
  }
};

class CharacteristicsCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    Serial.print("Value Written: ");
    Serial.println(pCharacteristic->getValue().c_str());

    if (pCharacteristic == box_characteristic)
    {
      boxValue = pCharacteristic->getValue().c_str();
      box_characteristic->setValue(const_cast<char *>(boxValue.c_str()));
      box_characteristic->notify();

      // Check the value of the box_characteristic and control the LEDs accordingly
      if (boxValue == "1")
      {
        digitalWrite(blueLEDPin, HIGH);  // Turn on the blue LED
        digitalWrite(redLEDPin, LOW);    // Turn off the red LED
      }
      else if (boxValue == "0")
      {
        digitalWrite(blueLEDPin, LOW);    // Turn off the blue LED
        digitalWrite(redLEDPin, HIGH);    // Turn on the red LED
      }
    }
    // Handle the "moving" characteristic
    if (pCharacteristic == moving_characteristic) {
      movingValue = pCharacteristic->getValue().c_str();
      moving_characteristic->setValue(const_cast<char *>(movingValue.c_str()));
      moving_characteristic->notify();
    }

    // Handle the "direction" characteristic
    if (pCharacteristic == direction_characteristic) {
      directionValue = pCharacteristic->getValue().c_str();
      direction_characteristic->setValue(const_cast<char *>(directionValue.c_str()));
      direction_characteristic->notify();
    }
  }
};


void setup()
{
  Serial.begin(115200);


  // Initialize the BLE Device
  BLEDevice::init("BLEExample");


  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());


  BLEService *pService = pServer->createService(SERVICE_UUID);


  message_characteristic = pService->createCharacteristic(
      MESSAGE_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);


  box_characteristic = pService->createCharacteristic(
      BOX_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);
 
  moving_characteristic = pService->createCharacteristic(
    MOVING_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY |
    BLECharacteristic::PROPERTY_INDICATE
);

direction_characteristic = pService->createCharacteristic(
    DIRECTION_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY |
    BLECharacteristic::PROPERTY_INDICATE
);


  pService->start();
  pServer->getAdvertising()->start();


  message_characteristic->setValue("Message one");
  message_characteristic->setCallbacks(new CharacteristicsCallbacks());


  box_characteristic->setValue("0");
  box_characteristic->setCallbacks(new CharacteristicsCallbacks());
  
  moving_characteristic->setValue("0");
  moving_characteristic->setCallbacks(new CharacteristicsCallbacks());

  direction_characteristic->setValue("0");
  direction_characteristic->setCallbacks(new CharacteristicsCallbacks());


  // Initialize LED pins as outputs
  pinMode(redLEDPin, OUTPUT);
  pinMode(blueLEDPin, OUTPUT);


  // Initially turn off both LEDs
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(blueLEDPin, LOW);


  Serial.println("Waiting for a client connection to notify...");


  //Actuator setup
  pinMode(pwmExtendPin, OUTPUT);
  pinMode(pwmRetractPin, OUTPUT);
}


void loop()
{
  // Periodically notify the message_characteristic
  /*
  message_characteristic->setValue("Message one");
  message_characteristic->notify();
  delay(1000);


  message_characteristic->setValue("Message Two");
  message_characteristic->notify();
  delay(1000);
  */

  if (movingValue == "1") {
    // Start the actuator based on the "direction" characteristic
    if (directionValue == "1") {
      // Move forward (extend)
      driveActuator(50, true);
    } else {
      // Move backward (retract)
      driveActuator(50, false);
    }
  } else {
    // Stop the actuator
    driveActuator(0, false);
  }
}
