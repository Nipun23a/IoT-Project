#include <DHT.h>
#include <Wire.h>
#include <HardwareSerial.h>

// Pin Definitions
#define MQ135_PIN 34       // Analog input for MQ-135
#define DHT_PIN 4          // Digital pin for DHT11
#define DHT_TYPE DHT11     // DHT sensor type

// LoRa E220 module pins
#define LORA_RX 16         // Connect to E220 TX
#define LORA_TX 17         // Connect to E220 RX
#define LORA_AUX 5         // Connect to E220 AUX
#define LORA_M0 18         // Connect to E220 M0
#define LORA_M1 19         // Connect to E220 M1

// Constants for MQ-135 sensor
#define RL_VALUE 10.0      // Load resistance in kOhm

// This will be updated during calibration
float R0_CLEAN_AIR = 76.63; // Initial R0 in clean air

// Thresholds for garbage area monitoring
#define NH3_THRESHOLD 25.0   // ppm
#define H2S_THRESHOLD 10.0   // ppm
#define CH4_THRESHOLD 1000.0 // ppm

// Gas-specific sensitivity values from datasheet (example values)
const float CO_CURVE[3] = {2.30, 0.72, -0.34};
const float NH3_CURVE[3] = {2.21, 0.59, -0.30};
const float NO2_CURVE[3] = {2.35, 0.64, -0.25};
const float SO2_CURVE[3] = {2.13, 0.28, -0.35};
const float BENZENE_CURVE[3] = {2.31, 0.49, -0.38};
const float ALCOHOL_CURVE[3] = {2.16, 0.52, -0.32};
const float SMOKE_CURVE[3] = {2.10, 0.51, -0.31};
const float H2S_CURVE[3] = {2.25, 0.61, -0.33};   // Added for garbage area
const float CH4_CURVE[3] = {2.35, 0.51, -0.36};   // Added for garbage area

// Define data structure for sending
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
  float h2s_ppm;    // Added for garbage area
  float ch4_ppm;    // Added for garbage area
  float air_quality;
};

// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

// Initialize the LoRa serial communication
HardwareSerial LoRaSerial(2); // Use UART2 for ESP32

// Function to calibrate MQ-135 sensor
float calibrateMQ135() {
  Serial.println("Calibrating MQ-135 sensor...");
  Serial.println("Please ensure sensor is in clean air");
  
  // Take multiple readings for accuracy
  float rs_sum = 0;
  int readings = 50;
  
  for (int i = 0; i < readings; i++) {
    int mq135_value = analogRead(MQ135_PIN);
    float sensor_volt = (float)mq135_value / 4095.0 * 5.0;
    float rs = ((5.0 * RL_VALUE) / sensor_volt) - RL_VALUE;
    rs_sum += rs;
    delay(100);
  }
  
  // Calculate average RS
  float rs_avg = rs_sum / readings;
  
  // In clean air, RS/R0 is approximately 1 for MQ-135
  // So R0 = RS in clean air
  float r0 = rs_avg;
  
  Serial.print("Calibration complete. R0 = ");
  Serial.println(r0);
  
  return r0;
}

// Function to calculate PPM based on RS/R0 ratio and gas curve
float calculatePPM(float rs_ro_ratio, const float curve[3]) {
  return pow(10, (((log10(rs_ro_ratio) - curve[1]) / curve[2]) + curve[0]));
}

// Function to check dangerous gas levels
void checkDangerousLevels(SensorData data) {
  bool danger = false;
  
  if (data.nh3_ppm > NH3_THRESHOLD) {
    Serial.println("WARNING: High ammonia levels detected!");
    danger = true;
  }
  
  if (data.h2s_ppm > H2S_THRESHOLD) {
    Serial.println("WARNING: High hydrogen sulfide levels detected!");
    danger = true;
  }
  
  if (data.ch4_ppm > CH4_THRESHOLD) {
    Serial.println("WARNING: High methane levels detected!");
    danger = true;
  }
  
  if (danger) {
    // Could add code for alarm or emergency notification
    // For example:
    // digitalWrite(ALARM_PIN, HIGH);
  }
}

// Function to send data via LoRa
void sendDataViaLoRa(SensorData data) {
  // Wait for AUX pin to be HIGH (module ready)
  while (digitalRead(LORA_AUX) == LOW) {
    delay(10);
  }
  
  // Create a buffer for the data
  uint8_t buffer[sizeof(SensorData)];
  memcpy(buffer, &data, sizeof(SensorData));
  
  // Send data through LoRa
  LoRaSerial.write(buffer, sizeof(SensorData));
  
  Serial.println("Data sent via LoRa");
}

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  Serial.println("ESP32 Air Quality Monitoring System for Garbage Areas");
  
  // Initialize DHT11
  dht.begin();
  
  // Initialize LoRa module
  pinMode(LORA_M0, OUTPUT);
  pinMode(LORA_M1, OUTPUT);
  pinMode(LORA_AUX, INPUT);
  
  // Set LoRa module to normal mode
  digitalWrite(LORA_M0, LOW);
  digitalWrite(LORA_M1, LOW);
  
  // Initialize LoRa serial
  LoRaSerial.begin(9600, SERIAL_8N1, LORA_RX, LORA_TX);
  
  // Wait for LoRa module to initialize
  delay(1000);
  Serial.println("LoRa module initialized");
  
  // Initialize MQ-135 (warmup)
  Serial.println("MQ-135 warming up for garbage area monitoring...");
  
  // For garbage area, extended warmup time for better accuracy
  Serial.println("Warming up sensor for 5 minutes...");
  for (int i = 0; i < 300; i++) {
    Serial.print(".");
    if (i % 60 == 0) Serial.println();
    delay(1000); // 1 second delay
  }
  Serial.println();
  
  // Calibrate the sensor
  float calibrated_r0 = calibrateMQ135();
  // Use this calibrated value
  R0_CLEAN_AIR = calibrated_r0;
  
  Serial.println("System initialization complete");
}

void loop() {
  // Create a data structure
  SensorData data;
  
  // Read DHT11 sensor
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  
  // Check if DHT reading was successful
  if (isnan(data.temperature) || isnan(data.humidity)) {
    Serial.println("Failed to read from DHT sensor!");
  } else {
    Serial.print("Temperature: ");
    Serial.print(data.temperature);
    Serial.print(" °C, Humidity: ");
    Serial.print(data.humidity);
    Serial.println(" %");
  }
  
  // Read MQ-135 sensor raw value
  int mq135_value = analogRead(MQ135_PIN);
  
  // Convert analog reading to resistance
  float sensor_volt = (float)mq135_value / 4095.0 * 5.0;
  float rs = ((5.0 * RL_VALUE) / sensor_volt) - RL_VALUE;
  float rs_ro_ratio = rs / R0_CLEAN_AIR;
  
  // Calculate gas concentrations using the ratio and gas curves
  data.nh3_ppm = calculatePPM(rs_ro_ratio, NH3_CURVE);
  data.so2_ppm = calculatePPM(rs_ro_ratio, SO2_CURVE);
  data.no2_ppm = calculatePPM(rs_ro_ratio, NO2_CURVE);
  data.benzene_ppm = calculatePPM(rs_ro_ratio, BENZENE_CURVE);
  data.co_ppm = calculatePPM(rs_ro_ratio, CO_CURVE);
  data.alcohol_ppm = calculatePPM(rs_ro_ratio, ALCOHOL_CURVE);
  data.smoke_ppm = calculatePPM(rs_ro_ratio, SMOKE_CURVE);
  data.h2s_ppm = calculatePPM(rs_ro_ratio, H2S_CURVE);  // Added for garbage area
  data.ch4_ppm = calculatePPM(rs_ro_ratio, CH4_CURVE);  // Added for garbage area
  
  // Improved air quality calculation for garbage area
  // For garbage areas, NH3, H2S and CH4 are most important
  data.air_quality = (data.nh3_ppm * 0.4) + (data.h2s_ppm * 0.4) + (data.ch4_ppm * 0.2);
  
  // Print gas concentrations
  Serial.println("---- Gas Concentrations (Garbage Area Optimized) ----");
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
  
  // Check for dangerous levels
  checkDangerousLevels(data);
  
  // Send data via LoRa
  sendDataViaLoRa(data);
  
  // Wait before next reading
  delay(10000); // 10 seconds delay
}
