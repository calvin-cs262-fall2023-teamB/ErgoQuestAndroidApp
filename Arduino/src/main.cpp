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
String location = "0";
String id = "0";

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define MESSAGE_CHARACTERISTIC_UUID "6d68efe5-04b6-4a85-abc4-c2670b7bf7fd"
#define BOX_CHARACTERISTIC_UUID "f27b53ad-c63d-49a0-8c0f-9f297e6cc520"
#define LOCATION_UUID "a5390fc3-c11e-43b6-b3a3-cfa9dacda542"

// Define LED pins
//const int redLEDPin = 32;   // Red LED is connected to GPIO 25
//const int blueLEDPin = 33;  // Blue LED is connected to GPIO 26

// Actuator variables
const int extendPins[] = {25, 14, 32};
const int retractPins[] = {26, 12, 33};
float targetPositions[] = {0.0, 0.0, 0.0};
float currentPositions[] = {0.0, 0.0, 0.0};
unsigned long previousMillis[] = {0, 0, 0};
bool moveActuators[] = {false, false, false};
unsigned long startTimes[] = {0, 0, 0};
const int NUM_ACTUATORS = 3;
const unsigned long moveInterval = 10; // Interval between position updates in milliseconds
const float maxExtent[] = {711.2, 170, 203.2}; // Maximum extent of the actuator in mm
const float maxSpeed[] = {40.64, 9.0, 11.0};    // Maximum speed of the actuator in mm/s

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
      /*
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
      */
    }
    // Handle the "location" characteristic
    else if (pCharacteristic == location_characteristic) {
      locationValue = pCharacteristic->getValue().c_str();
      id = locationValue.substring(0,1);
      location = locationValue.substring(2);
      Serial.println("Moving actuator " + id + " to " + location + "%");
      location_characteristic->setValue(const_cast<char *>(location.c_str()));
      location_characteristic->notify();
      
      int actuatorIndex = id.toInt();
      targetPositions[actuatorIndex] = (location.toInt() / 100.0) * maxExtent[actuatorIndex];
      moveActuators[actuatorIndex] = true;
      startTimes[actuatorIndex] = millis();  // Record start time for the actuator
    }
  }
};

void setup()
{
  Serial.begin(115200);
  BLEDevice::init("BLEExample");
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

  //pinMode(redLEDPin, OUTPUT);
  //pinMode(blueLEDPin, OUTPUT);
  //digitalWrite(redLEDPin, HIGH);
  //digitalWrite(blueLEDPin, LOW);

  Serial.println("Waiting for a client connection to notify...");

  for (int i = 0; i < NUM_ACTUATORS; ++i)
  {
    pinMode(extendPins[i], OUTPUT);
    pinMode(retractPins[i], OUTPUT);
    digitalWrite(extendPins[i], LOW);
    digitalWrite(retractPins[i], HIGH);
  }

  delay((maxExtent[1] / maxSpeed[1]) * 1000);
  Serial.println("Actuators are zeroed.");

  for (int i = 0; i < NUM_ACTUATORS; ++i)
  {
    digitalWrite(extendPins[i], LOW);
    digitalWrite(retractPins[i], LOW);
  }
}

void moveActuator(int actuatorIndex) {
  unsigned long currentMillis = millis();

  // Calculate the time needed to reach the target position
  float distanceToMove = targetPositions[actuatorIndex] - currentPositions[actuatorIndex];
  float moveDistance = maxSpeed[actuatorIndex] * moveInterval / 1000.0;

  if (abs(distanceToMove) > moveDistance) {
    if (distanceToMove > 0) {
      // Extend the actuator
      digitalWrite(extendPins[actuatorIndex], HIGH);
      digitalWrite(retractPins[actuatorIndex], LOW);
      currentPositions[actuatorIndex] += moveDistance;
    } else {
      // Retract the actuator
      digitalWrite(extendPins[actuatorIndex], LOW);
      digitalWrite(retractPins[actuatorIndex], HIGH);
      currentPositions[actuatorIndex] -= moveDistance;
    }
  } else {
    // Stop moving when the target position is reached
    digitalWrite(extendPins[actuatorIndex], LOW);
    digitalWrite(retractPins[actuatorIndex], LOW);
    currentPositions[actuatorIndex] = targetPositions[actuatorIndex];
    Serial.println("Actuator " + String(actuatorIndex) + " reached target position");
    moveActuators[actuatorIndex] = false;  // Reset the flag
  }
}

void loop()
{
  for (int i = 0; i < NUM_ACTUATORS; ++i)
  {
    if (moveActuators[i] && millis() - startTimes[i] >= moveInterval) {
      moveActuator(i);
      startTimes[i] = millis();  // Reset the start time after moving
    }
  }
}

