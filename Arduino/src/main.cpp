#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

BLEServer *pServer = NULL;
BLECharacteristic *message_characteristic = NULL;
BLECharacteristic *box_characteristic = NULL;
BLECharacteristic *location_characteristic = NULL;

String boxValue = "0";
String locationValue = "0";

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define MESSAGE_CHARACTERISTIC_UUID "6d68efe5-04b6-4a85-abc4-c2670b7bf7fd"
#define BOX_CHARACTERISTIC_UUID "f27b53ad-c63d-49a0-8c0f-9f297e6cc520"
#define LOCATION_UUID "a5390fc3-c11e-43b6-b3a3-cfa9dacda542"

// Define LED pins
const int redLEDPin = 32;   // Red LED is connected to GPIO 25
const int blueLEDPin = 33;  // Blue LED is connected to GPIO 26

// Actuator variables (some will only be used if we figure out hall effect sensor)
const int ExtendPin = 25;       // PWM pin for extending the actuator
const int RetractPin = 26;      // PWM pin for retracting the actuator
//const int hallEffectPin1 = 34;      // Hall Effect sensor pin
//const int hallEffectPin2 = 35;      // Hall Effect sensor pin
const int pulsePerInch = 3500;     // Pulses per inch of actuator travel
long pos = 0;                       // Actuator position in pulses
long prevPos = 0;                   // Previous position
bool dir = 0;                       // Direction of actuator (0 = Retract, 1 = Extend)
unsigned long prevTimer = 0;  // Time stamp of the last pulse
bool homeFlag = 0;           // Flag to know if the actuator is homed
long steps = 0;              // Pulses from the Hall Effect sensor

// Actuator parameters
const float maxExtent = 170; // Maximum extent of the actuator in mm
const float maxSpeed = 9.0;    // Maximum speed of the actuator in mm/s

// Actuator position control
float currentPosition = 0.0; // Initialize current position
float targetPosition = 0.0; // Initialize target position
unsigned long previousMillis = 0;
unsigned long moveInterval = 10; // Interval between position updates in milliseconds

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
    Serial.println(targetPosition);

    if (pCharacteristic == box_characteristic)
    {
      Serial.println("handling box characteristic");
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
    // Handle the "location" characteristic
    if (pCharacteristic == location_characteristic) {
      Serial.println("handling location characteristic");
      locationValue = pCharacteristic->getValue().c_str();
      location_characteristic->setValue(const_cast<char *>(locationValue.c_str()));
      location_characteristic->notify();
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
      BLECharacteristic::PROPERTY_INDICATE
  );

  box_characteristic = pService->createCharacteristic(
      BOX_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE |
      BLECharacteristic::PROPERTY_NOTIFY |
      BLECharacteristic::PROPERTY_INDICATE
  );

  location_characteristic = pService->createCharacteristic(
      LOCATION_UUID,
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

  location_characteristic->setValue("0");
  location_characteristic->setCallbacks(new CharacteristicsCallbacks());

  // Initialize LED pins as outputs
  pinMode(redLEDPin, OUTPUT);
  pinMode(blueLEDPin, OUTPUT);

  // Initially turn off both LEDs
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(blueLEDPin, LOW);

  Serial.println("Waiting for a client connection to notify...");

  //Actuator setup
  pinMode(ExtendPin, OUTPUT);
  pinMode(RetractPin, OUTPUT);

  // Ensure the actuator is zeroed at startup
  digitalWrite(ExtendPin, LOW);
  digitalWrite(RetractPin, HIGH);

  // Wait for the actuator to fully retract and zeroed
  delay((maxExtent / maxSpeed) * 1000);

  Serial.println("Actuator is zeroed.");
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

  targetPosition = (locationValue.toInt() / 100.0) * maxExtent;
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= moveInterval) {
    previousMillis = currentMillis;

    // Calculate the time needed to reach the target position
    float distanceToMove = targetPosition - currentPosition;
    float moveDistance = maxSpeed * moveInterval / 1000.0;

    if (abs(distanceToMove) > moveDistance) {
      if (distanceToMove > 0) {
        // Extend the actuator
        digitalWrite(ExtendPin, HIGH);
        digitalWrite(RetractPin, LOW);
        currentPosition += moveDistance;
      } else {
        // Retract the actuator
        digitalWrite(ExtendPin, LOW);
        digitalWrite(RetractPin, HIGH);
        currentPosition -= moveDistance;
      }
    } else {
      // Stop moving when the target position is reached
      digitalWrite(ExtendPin, LOW);
      digitalWrite(RetractPin, LOW);
      currentPosition = targetPosition;
    }
  }
}
