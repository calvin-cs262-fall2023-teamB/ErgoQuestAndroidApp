#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

BLEServer *pServer = NULL;
BLECharacteristic *message_characteristic = NULL;
BLECharacteristic *box_characteristic = NULL;

String boxValue = "0";

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define MESSAGE_CHARACTERISTIC_UUID "6d68efe5-04b6-4a85-abc4-c2670b7bf7fd"
#define BOX_CHARACTERISTIC_UUID "f27b53ad-c63d-49a0-8c0f-9f297e6cc520"

// Define LED pins
const int redLEDPin = 25;   // Red LED is connected to GPIO 25
const int blueLEDPin = 26;  // Blue LED is connected to GPIO 26

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

  pService->start();
  pServer->getAdvertising()->start();

  message_characteristic->setValue("Message one");
  message_characteristic->setCallbacks(new CharacteristicsCallbacks());

  box_characteristic->setValue("0");
  box_characteristic->setCallbacks(new CharacteristicsCallbacks());

  // Initialize LED pins as outputs
  pinMode(redLEDPin, OUTPUT);
  pinMode(blueLEDPin, OUTPUT);

  // Initially turn off both LEDs
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(blueLEDPin, LOW);

  Serial.println("Waiting for a client connection to notify...");
}

void loop()
{
  // Periodically notify the message_characteristic
  message_characteristic->setValue("Message one");
  message_characteristic->notify();
  delay(1000);

  message_characteristic->setValue("Message Two");
  message_characteristic->notify();
  delay(1000);
}
