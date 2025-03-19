#include <HardwareSerial.h>
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <time.h>

// Firebase and WiFi credentials
#define WIFI_SSID "Dialog 4G 833"
#define WIFI_PASSWORD "7949kaweya"

// Firebase project settings
#define API_KEY "AIzaSyAOStbryJ-cgbxv8nSv-z3dTisE4IXQN3A" // From Project Settings > General
#define DATABASE_URL "iot-project-b0154-default-rtdb.asia-southeast1.firebasedatabase.app" //https://console.firebase.google.com/project/iot-project-b0154/database/iot-project-b0154-default-rtdb/data/~2F
#define USER_EMAIL "iot@example.com" // Service account email or regular user email
#define USER_PASSWORD "7949IoTDevice" // Service account password or regular user password

// Define Firebase data objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Pin Definitions for LoRa E220 module
#define LORA_RX 16         // Connect to E220 TX
#define LORA_TX 17         // Connect to E220 RX
#define LORA_AUX 5         // Connect to E220 AUX
#define LORA_M0 18         // Connect to E220 M0
#define LORA_M1 19         // Connect to E220 M1

// Define data structure for receiving
struct SensorData {
  float temperature;
  float humidity;
  float nh3_ppm;
  float so2_ppm;
  float no2_ppm;
  float benzene_ppm;
  float co_ppm;
  float alcohol_ppm;
  float smoke_ppm;
  float h2s_ppm;    
  float ch4_ppm;   
  float air_quality;
};

// Transmitter IDs - virtual transmitters
const int transmitterIds[] = {101, 102, 103}; // Example IDs
const int numTransmitters = sizeof(transmitterIds) / sizeof(transmitterIds[0]);

// Variable to track which transmitter ID to use next
int nextTransmitterIndex = 0; 

// Initialize the LoRa serial communication
HardwareSerial LoRaSerial(2); // Use UART2 for ESP32

// Time settings for timestamps
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0;
const int   daylightOffset_sec = 3600;

// Firebase authentication status
bool firebaseAuthenticated = false;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  Serial.println("ESP32 LoRa Receiver with Firebase - Rotating Virtual Transmitters");
  
  // Initialize LoRa module
  pinMode(LORA_M0, OUTPUT);
  pinMode(LORA_M1, OUTPUT);
  pinMode(LORA_AUX, INPUT);
  
  // Set LoRa module to normal mode
  digitalWrite(LORA_M0, LOW);
  digitalWrite(LORA_M1, LOW);
  
  // Initialize LoRa serial
  LoRaSerial.begin(9600, SERIAL_8N1, LORA_RX, LORA_TX);
  
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  
  // Initialize time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // Initialize Firebase
  initFirebase();
  
  // Wait for LoRa module to initialize
  delay(1000);
  Serial.println("LoRa receiver initialized");
}

void initFirebase() {
  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Authentication
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // Set timeout
  fbdo.setResponseSize(4096);
  
  // Verify authentication
  String uid = auth.token.uid.c_str();
  if (uid != "") {
    Serial.println("Firebase authenticated");
    firebaseAuthenticated = true;
  } else {
    Serial.println("Firebase authentication failed");
    firebaseAuthenticated = false;
  }
}

void loop() {
  // Check if data is available from LoRa
  if (LoRaSerial.available() >= sizeof(SensorData)) {
    // Buffer to receive data
    uint8_t buffer[sizeof(SensorData)];
    
    // Read data into buffer
    LoRaSerial.readBytes(buffer, sizeof(SensorData));
    
    // Convert buffer to SensorData struct
    SensorData data;
    memcpy(&data, buffer, sizeof(SensorData));
    
    // Print received data
    Serial.println("\n----- Received Air Quality Data -----");
    Serial.print("Temperature: "); Serial.print(data.temperature); Serial.println(" °C");
    Serial.print("Humidity: "); Serial.print(data.humidity); Serial.println(" %");
    Serial.println("---- Gas Concentrations ----");
    Serial.print("NH3: "); Serial.print(data.nh3_ppm); Serial.println(" ppm");
    Serial.print("SO2: "); Serial.print(data.so2_ppm); Serial.println(" ppm");
    Serial.print("NO2: "); Serial.print(data.no2_ppm); Serial.println(" ppm");
    Serial.print("Benzene: "); Serial.print(data.benzene_ppm); Serial.println(" ppm");
    Serial.print("CO: "); Serial.print(data.co_ppm); Serial.println(" ppm");
    Serial.print("Alcohol: "); Serial.print(data.alcohol_ppm); Serial.println(" ppm");
    Serial.print("Smoke: "); Serial.print(data.smoke_ppm); Serial.println(" ppm");
    Serial.print("H2S: "); Serial.print(data.h2s_ppm); Serial.println(" ppm");
    Serial.print("CH4: "); Serial.print(data.ch4_ppm); Serial.println(" ppm");
    Serial.print("Air Quality Index: "); Serial.println(data.air_quality);
    
    // Get the current transmitter ID to use
    int currentTransmitterId = transmitterIds[nextTransmitterIndex];
    
    // Upload data with the current transmitter ID
    Serial.print("Uploading data for virtual transmitter ID: ");
    Serial.println(currentTransmitterId);
    uploadToFirebase(data, currentTransmitterId);
    
    // Move to next transmitter ID for the next data packet
    nextTransmitterIndex = (nextTransmitterIndex + 1) % numTransmitters;
    Serial.print("Next data packet will use transmitter ID: ");
    Serial.println(transmitterIds[nextTransmitterIndex]);
  }
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    WiFi.reconnect();
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("WiFi reconnected");
  }
  
  // Check Firebase token expiration and refresh if needed
  if (Firebase.isTokenExpired() && firebaseAuthenticated) {
    Firebase.refreshToken(&config);
    Serial.println("Firebase token refreshed");
  }
  
  // Small delay
  delay(100);
}

void uploadToFirebase(SensorData data, int transmitterId) {
  // Check if authenticated
  if (!firebaseAuthenticated) {
    Serial.println("Firebase not authenticated, cannot upload data");
    return;
  }
  
  // Get current timestamp
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }
  
  char timestamp[64];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%d_%H:%M:%S", &timeinfo);
  
  // Create a unique entry path using timestamp and transmitter ID
  String path = "/air_quality_data/transmitter_" + String(transmitterId) + "/" + String(timestamp);
  
  Serial.print("Uploading to Firebase at path: ");
  Serial.println(path);
  
  // Set JSON data for Firebase
  FirebaseJson json;
  json.set("timestamp", timestamp);
  json.set("transmitter_id", transmitterId);
  json.set("temperature", data.temperature);
  json.set("humidity", data.humidity);
  json.set("nh3_ppm", data.nh3_ppm);
  json.set("so2_ppm", data.so2_ppm);
  json.set("h2s_ppm", data.h2s_ppm);
  json.set("ch4_ppm", data.ch4_ppm);
  json.set("no2_ppm", data.no2_ppm);
  json.set("benzene_ppm", data.benzene_ppm);
  json.set("co_ppm", data.co_ppm);
  json.set("alcohol_ppm", data.alcohol_ppm);
  json.set("smoke_ppm", data.smoke_ppm);
  json.set("air_quality", data.air_quality);
  
  // Upload data to Firebase
  if (Firebase.setJSON(fbdo, path, json)) {
    Serial.println("Data uploaded successfully for transmitter ID: " + String(transmitterId));
  } else {
    Serial.println("Failed to upload data for transmitter ID: " + String(transmitterId));
    Serial.println("Reason: " + fbdo.errorReason());
  }
}
