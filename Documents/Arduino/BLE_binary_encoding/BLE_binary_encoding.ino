// Include necessary libraries for BLE functionality and JSON handling
#include <BLEDevice.h> // Main BLE library for ESP32
#include <BLEUtils.h> // Utility library for BLE
#include <BLEServer.h> // Library to use ESP32 as a BLE server
#include <ArduinoJson.h> // Library for JSON serialization and parsing
#include <sstream> // Library for string stream operations (used in splitting strings)
#include <vector> // Library for using dynamic arrays

// Define UUIDs for the custom BLE service and characteristic
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b" // Unique identifier for the BLE service
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8" // Unique identifier for the BLE characteristic

// Declaration of global variables for BLE characteristics and advertising
BLECharacteristic *pConsentCharacteristic; // Pointer to the BLE Characteristic object
BLEAdvertising *pAdvertising; // Pointer to the BLE Advertising object

struct ConsentRequest {
    std::string id;
    std::string deviceName;
    std::string summary;
    std::string purposes;
    std::string processing;
    std::string dataCategory;
    std::string measures;
    std::string legalBases;
    std::string storage;
    std::string scale;
    std::string duration;
    std::string frequency;
    std::string location;
};

// Dynamic array to store multiple consent requests
std::vector<ConsentRequest> consentRequests;

bool isAdvertising = false;

void ensureAdvertising() {
    if (!isAdvertising) {
        BLEDevice::startAdvertising();
        Serial.println("Advertising started");
        isAdvertising = true; // Update the flag
    }
}

void updateAdvertisingData();


// Callback class for BLE server events (connection and disconnection)
class MyServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) override {
        updateAdvertisingData();
        Serial.println("Device connected");
        digitalWrite(LED_BUILTIN, HIGH); // Turn on the built-in LED to indicate connection
        delay(200); // Keep the LED on for 200 milliseconds as an indicator
        digitalWrite(LED_BUILTIN, LOW); // Turn off the LED
        isAdvertising = false;
    }

    void onDisconnect(BLEServer* pServer) override {
        BLEDevice::startAdvertising();
        Serial.println("Device disconnected");
        digitalWrite(LED_BUILTIN, HIGH); // Turn on the built-in LED to indicate disconnection
        delay(200); // Keep the LED on for 200 milliseconds as an indicator
        digitalWrite(LED_BUILTIN, LOW); // Turn off the LED
        isAdvertising = false;
    }
};

// Callback class for handling BLE characteristic write operations
class MyCharacteristicCallbacks: public BLECharacteristicCallbacks {
  void handleDeletionRequest(const std::string& partialConsentId) {
    auto it = std::remove_if(consentRequests.begin(), consentRequests.end(), 
                             [&partialConsentId](const ConsentRequest& request) {
        // Use substr to compare the beginning of the stored ID with the partial ID
        return request.id.substr(0, partialConsentId.length()) == partialConsentId;
    });

    // If any elements were removed
    if (it != consentRequests.end()) {
        consentRequests.erase(it, consentRequests.end());
        Serial.print("Consent ID deleted: ");
        Serial.println(partialConsentId.c_str());
    } else {
        Serial.print("Consent ID not found: ");
        Serial.println(partialConsentId.c_str());
    }
}

void onRead(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    Serial.print("Current Value: ");
    Serial.println(value.c_str()); // Use c_str() to convert std::string to const char*
}



void onWrite(BLECharacteristic *pCharacteristic) override {
    std::string value = pCharacteristic->getValue();
    Serial.print("Received request: ");
    Serial.println(value.c_str());


    // Check if this is a delete request
    if (value.rfind("delete:", 0) == 0) {
        Serial.println("Received delete request");
        std::string consentId = value.substr(7); // This will now be 'q1', 'q2', etc.
        handleDeletionRequest(consentId);
    } else {
        std::vector<uint8_t> rxValue(value.begin(), value.end()); // Convert the data from string to vector<uint8_t>
        Serial.println("Received write request");

        // Split the received string by ';' to extract individual consent IDs
        std::vector<std::string> acceptedIds = split(value, ';');

        // Iterate through the extracted consent IDs and process them
        for (const std::string& id : acceptedIds) {
            Serial.print("Consent Accepted: ");
            Serial.println(id.c_str()); // Log each accepted consent ID
        }
    }
  }


    // Helper function to split a string by a given delimiter and return a vector of substrings
    std::vector<std::string> split(const std::string &s, char delimiter) {
        std::vector<std::string> tokens;
        std::string token;
        std::istringstream tokenStream(s); // Use string stream to facilitate splitting
        while (std::getline(tokenStream, token, delimiter)) { // Extract tokens delimited by 'delimiter'
            tokens.push_back(token);
        }
        return tokens;
    }
};

// Function to dynamically encode a ConsentRequest object into a byte vector
std::vector<uint8_t> encodeConsentRequestDynamic(const ConsentRequest& request) {
    std::vector<uint8_t> encodedData;
    auto appendData = [&encodedData](const std::string& field) {
        uint8_t len = static_cast<uint8_t>(field.length()); // Get the length of the field
        encodedData.push_back(len); // Append the length as a byte
        encodedData.insert(encodedData.end(), field.begin(), field.end()); // Append the field data
    };

    // Encode each field of the ConsentRequest
// Example usage of appendData with the new ConsentRequest structure
appendData(request.id);
appendData(request.deviceName);
appendData(request.summary);
appendData(request.processing); // This line was updated to match the new field name
appendData(request.purposes); // Updated to reflect the correct field name from the new structure

// Assuming you would like to append the new fields as well
appendData(request.dataCategory);
appendData(request.measures);
appendData(request.legalBases);
appendData(request.storage);
appendData(request.scale);
appendData(request.duration); // Newly separated
appendData(request.frequency); // Newly separated
appendData(request.location);

    return encodedData; // Return the dynamically encoded data
}


// Setup function to initialize the BLE environment
void setup() {
    Serial.begin(115200); // Start serial communication at 115200 baud rate
    Serial.println("Starting BLE work!");
    
    pinMode(LED_BUILTIN, OUTPUT); // Set the built-in LED as an output
   
    // Initialize the BLE device
    BLEDevice::init("ADPC_Beacon");
    // Create a BLE server
    BLEServer *pServer = BLEDevice::createServer();
    pServer->setCallbacks(new MyServerCallbacks()); // Set server callbacks for connect/disconnect events
    // Create a BLE service
    BLEService *pService = pServer->createService(SERVICE_UUID);


// Set up BLE security
BLESecurity *pSecurity = new BLESecurity();

// Set the authentication mode to require bonding with secure connection
pSecurity->setAuthenticationMode(ESP_LE_AUTH_BOND);

// Set the IO capability (adjust this based on your specific requirements)
pSecurity->setCapability(ESP_IO_CAP_IO);

pSecurity->setInitEncryptionKey(ESP_BLE_ENC_KEY_MASK | ESP_BLE_ID_KEY_MASK);

    // Create a BLE characteristic for the service
    pConsentCharacteristic = pService->createCharacteristic(
                                        CHARACTERISTIC_UUID,
                                        BLECharacteristic::PROPERTY_READ |
                                        BLECharacteristic::PROPERTY_WRITE |
                                        BLECharacteristic::PROPERTY_NOTIFY
                                      );

    // Set callbacks for the characteristic to handle write operations
    pConsentCharacteristic->setCallbacks(new MyCharacteristicCallbacks()); 
  
    pService->start(); // Start the service

    // Start advertising the BLE service
    pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);  // Functions that help with iPhone connections issue
    pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();
    Serial.println("BLE service is now advertising");

    // Populate the consentRequests vector with sample data
   consentRequests.push_back({
        "q1serviceCustomization", 
        "Smart Thermostat", 
        "Customize home heating and cooling preferences.",
        "Service Personalization: temperature settings based on preferences and schedule.",
        "Access, Store: schedule patterns, temperature preferences",
        "Inferred Data: Schedule, Device usage",
        "Technical Measures: Data encryption, Anonymization of data",
        "Legitimate interest of data subject",
        "Human involvement for Control",
        "Small scale processing",
        "Temporal duration", 
        "Continous frequency", 
        "Fixed location"
    });

    consentRequests.push_back({
        "q2activityMonitoring", 
        "Fitness Tracker", 
        "Track and analyze physical activity and health data",
        "Academic Research: provide insights for fitness goals",
        "Collect, Assess: Steps taken, heart rate",
        "Collected Personal Data: Health and fitness data",
        "Technical Measures: Data encryption, User access controls",
        "Vital interest",
        "Human involvement for intervention",
        "Small scale processing",
        "Until event duration", 
        "Often Frequency", 
        "Decentralized locations"
    }); 

    consentRequests.push_back({
        "q3homeSecurity", 
        "Security Camera", 
        "Monitor your home with smart security solutions",
        "Enforce Security: monitoring for unusual activity",
        "Acquire, Pseudonomyse: Video and audio recording, motion",
        "Sensitive Data: Video data, Motion events",
        "Technical Measures: Data encryption, Limited access",
        "Legal Obligation",
        "Human not involved",
        "Medium scale processing",
        "Indeterminate duration", 
        "Sporadic frequency", 
        "Random location" 
    });
}

void updateAdvertisingData() {
    static size_t currentIndex = 0;
    if (currentIndex >= consentRequests.size()) currentIndex = 0;

    // Encode the current consent request into a byte vector
    std::vector<uint8_t> encodedData = encodeConsentRequestDynamic(consentRequests[currentIndex]);

    // Update the characteristic's value with the new consent request
    if (pConsentCharacteristic != nullptr) {
        pConsentCharacteristic->setValue(encodedData.data(), encodedData.size());
        std::string currentValue = pConsentCharacteristic->getValue();
        Serial.print("Current Value: ");
        Serial.println(currentValue.c_str());
        Serial.print("Updated to consent request: ");
        Serial.println(consentRequests[currentIndex].id.c_str());

        // Optional: Log the new characteristic value for verification
        Serial.print("New Characteristic Value Set: ");
        for (auto byte : encodedData) {
            Serial.printf("%02X ", byte);
        }
        Serial.println();
    } else {
        Serial.println("Error: pConsentCharacteristic is nullptr.");
    }

    currentIndex++; // Prepare for next update
    ensureAdvertising(); // Make sure the device keeps advertising
}


// Main loop function, called repeatedly
void loop() {
ensureAdvertising(); // Continuously ensure that advertising is active
    delay(10000); // Delay to prevent too frequent checks; adjust as needed
}
