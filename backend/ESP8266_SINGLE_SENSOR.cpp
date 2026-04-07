// ============================================================================
// WSN Single Motion Sensor + Backend Integration
// Simplified code for ONE motion sensor (No multi-zone needed)
// ============================================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== CONFIGURATION =====
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* backendUrl = "http://192.168.1.100:8000/api";  // Replace IP

// ===== PIN DEFINITIONS =====
const int TRIG_PIN = D5;        // Ultrasonic trigger
const int ECHO_PIN = D6;        // Ultrasonic echo
const int DHT_PIN = D4;         // Temperature/Humidity sensor
const int MOTION_PIN = D0;      // Motion/Intruder sensor
const int LED_PIN = D1;         // Alert LED
const int BUZZER_PIN = D2;      // Alert Buzzer
const int SERVO_PIN = D3;       // Servo motor

// ===== SENSOR VARIABLES =====
float ultrasonic_distance = 0;
float temperature = 0;
float humidity = 0;
int signal_strength = 0;
bool motion_detected = false;

// ===== TIMING =====
unsigned long lastSensorUpdate = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 5000;  // 5 seconds

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(MOTION_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(SERVO_PIN, OUTPUT);
  
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  Serial.println("\n\nStarting Single Motion Sensor System...");
  
  // Connect to WiFi
  connectToWiFi();
}

void loop() {
  // Reconnect if WiFi drops
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }
  
  // Read sensors every 5 seconds
  if (millis() - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    lastSensorUpdate = millis();
    
    // Read all sensors
    readUltrasonicSensor();
    readDHTSensor();
    readSignalStrength();
    checkMotion();
    
    // Send to backend
    sendSensorDataToBackend();
    
    // Print to serial
    printSensorData();
  }
  
  delay(100);
}

// ===== WiFi Connection =====
void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n✗ Failed to connect to WiFi");
  }
}

// ===== SENSOR READING FUNCTIONS =====

void readUltrasonicSensor() {
  // Send pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read duration
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  ultrasonic_distance = (duration * 0.034) / 2;
}

void readDHTSensor() {
  // Simulated values - replace with actual DHT code if needed
  temperature = 25 + (random(0, 20) / 10.0);
  humidity = 50 + random(0, 30);
}

void readSignalStrength() {
  signal_strength = (WiFi.RSSI() + 100) * 2;  // Convert to 0-100%
  if (signal_strength > 100) signal_strength = 100;
  if (signal_strength < 0) signal_strength = 0;
}

void checkMotion() {
  motion_detected = (digitalRead(MOTION_PIN) == HIGH);
  
  // If motion detected, trigger alert and send to backend
  if (motion_detected) {
    Serial.println("🚨 MOTION DETECTED!");
    triggerAlert();
    reportMotion();
  }
}

// ===== SEND DATA TO BACKEND =====

void sendSensorDataToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected");
    return;
  }
  
  HTTPClient http;
  
  // Create JSON - NO zone_id needed for single sensor
  StaticJsonDocument<256> doc;
  doc["ultrasonic"] = ultrasonic_distance;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["signal"] = signal_strength;
  
  // Serialize to string
  String payload;
  serializeJson(doc, payload);
  
  // Send to backend
  http.begin(String(backendUrl) + "/sensors/bulk");
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    if (httpCode == 200) {
      Serial.println("✓ Data sent to backend");
    } else {
      Serial.println("⚠ Backend response: " + String(httpCode));
    }
  } else {
    Serial.println("✗ Failed to send data: " + http.errorToString(httpCode));
  }
  
  http.end();
}

void reportMotion() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  // Create intruder alert (optional - for critical motion detection)
  StaticJsonDocument<256> doc;
  doc["id"] = "motion_" + String(millis());
  doc["zone_id"] = "zone1";  // Single zone for your system
  doc["timestamp"] = getTimestamp();
  doc["confidence"] = 0.9;
  doc["details"] = "Motion detected by single sensor";
  
  String payload;
  serializeJson(doc, payload);
  
  http.begin(String(backendUrl) + "/intruders");
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST(payload);
  
  if (httpCode == 200) {
    Serial.println("✓ Intruder alert sent");
  }
  
  http.end();
}

// ===== ALERT FUNCTIONS =====

void triggerAlert() {
  // Turn on LED
  digitalWrite(LED_PIN, HIGH);
  
  // Sound buzzer
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  delay(200);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  
  // Keep LED on for 5 seconds
  delay(5000);
  digitalWrite(LED_PIN, LOW);
}

// ===== UTILITY FUNCTIONS =====

String getTimestamp() {
  // Simple timestamp (in production, use NTP)
  return "2026-04-07T" + String(millis() / 1000) + "Z";
}

void printSensorData() {
  Serial.println("\n--- Sensor Data ---");
  Serial.print("Distance: ");
  Serial.print(ultrasonic_distance);
  Serial.println(" cm");
  
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  
  Serial.print("Signal Strength: ");
  Serial.print(signal_strength);
  Serial.println(" %");
  
  Serial.print("Motion Detected: ");
  Serial.println(motion_detected ? "YES" : "NO");
  
  Serial.print("WiFi Status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  Serial.println("");
}
