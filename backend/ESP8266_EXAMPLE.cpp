# Arduino/ESP8266 Code Example

This example shows how to send data from your ESP8266 to the FastAPI backend.

## Arduino Libraries Required
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>  // https://github.com/bblanchon/ArduinoJson
```

## Complete ESP8266 Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

// Backend server details
const char* backendUrl = "http://192.168.1.100:8000";  // Replace with your backend IP
const char* serverName = "http://192.168.1.100:8000/api";

// Pin definitions
const int TRIG_PIN = D5;        // GPIO14
const int ECHO_PIN = D6;        // GPIO12
const int DHT_PIN = D4;         // GPIO2
const int MOTION_PIN = D0;      // GPIO16
const int LED_PIN = D1;         // GPIO5
const int BUZZER_PIN = D2;      // GPIO4
const int SERVO_PIN = D3;       // GPIO0

// Sensor variables
float ultrasonic_distance = 0;
float temperature = 0;
float humidity = 0;
int signal_strength = 0;
String zone_id = "zone1";

// Timing variables
unsigned long lastSensorUpdate = 0;
unsigned long sensorUpdateInterval = 5000;  // 5 seconds

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
  
  Serial.println("\n\nWSN Device Starting...");
  
  // Connect to WiFi
  connectToWiFi();
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconnecting to WiFi...");
    connectToWiFi();
  }
  
  // Read sensors periodically
  if (millis() - lastSensorUpdate >= sensorUpdateInterval) {
    lastSensorUpdate = millis();
    
    // Read sensors
    readUltrasonicSensor();
    readDHTSensor();
    readSignalStrength();
    
    // Send sensor data to backend
    sendSensorData();
    
    // Check for motion
    if (digitalRead(MOTION_PIN) == HIGH) {
      Serial.println("Motion detected!");
      reportIntruder();
    }
  }
  
  delay(100);
}

// ===== WiFi Functions =====

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
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

// ===== Sensor Reading Functions =====

void readUltrasonicSensor() {
  // Send ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Measure echo time
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  ultrasonic_distance = (duration * 0.034) / 2;
  
  Serial.print("Distance: ");
  Serial.print(ultrasonic_distance);
  Serial.println(" cm");
}

void readDHTSensor() {
  // Example DHT22 read (add DHT library if needed)
  // temperature = dht.readTemperature();
  // humidity = dht.readHumidity();
  
  // Simulated values for testing
  temperature = random(20, 35);
  humidity = random(40, 80);
  
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print(" C, Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
}

void readSignalStrength() {
  signal_strength = (WiFi.RSSI() + 100) * 2;  // Convert to percentage
  if (signal_strength > 100) signal_strength = 100;
  if (signal_strength < 0) signal_strength = 0;
  
  Serial.print("Signal Strength: ");
  Serial.print(signal_strength);
  Serial.println(" %");
}

// ===== HTTP Request Functions =====

void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["ultrasonic"] = ultrasonic_distance;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["signal"] = signal_strength;
  doc["zone_id"] = zone_id;
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("Sending sensor data: " + payload);
  
  // Send POST request
  http.begin(String(serverName) + "/sensors/bulk");
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("Error sending sensor data: " + String(httpResponseCode));
  }
  
  http.end();
}

void reportIntruder() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["id"] = "intruder_" + String(millis());
  doc["zone_id"] = zone_id;
  doc["timestamp"] = "2026-04-07T10:30:00";  // Replace with real timestamp
  doc["confidence"] = 0.95;
  doc["details"] = "Motion detected by sensor";
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("Reporting intruder: " + payload);
  
  // Trigger buzzer and LED
  digitalWrite(BUZZER_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);
  
  // Send POST request
  http.begin(String(serverName) + "/intruders");
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Intruder report response: " + String(httpResponseCode));
  } else {
    Serial.println("Error reporting intruder: " + String(httpResponseCode));
  }
  
  http.end();
  
  // Turn off buzzer and LED after 2 seconds
  delay(2000);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
}

void createAlert(String alertType, String severity, String details) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["zone_id"] = zone_id;
  doc["alert_type"] = alertType;
  doc["severity"] = severity;
  doc["details"] = details;
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.println("Creating alert: " + payload);
  
  // Send POST request
  http.begin(String(serverName) + "/alerts");
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Alert creation response: " + String(httpResponseCode));
  }
  
  http.end();
}

// ===== Device Control Endpoints =====

void controlLED(bool status) {
  digitalWrite(LED_PIN, status ? HIGH : LOW);
}

void controlBuzzer(bool status) {
  digitalWrite(BUZZER_PIN, status ? HIGH : LOW);
}

void controlServo(bool status) {
  // Implement servo control based on your servo
  // digitalWrite(SERVO_PIN, status ? HIGH : LOW);
}
```

## Key Points:

1. **WiFi Connection**: Replace `YOUR_SSID` and `YOUR_PASSWORD` with your credentials
2. **Backend URL**: Update `192.168.1.100` with your backend server IP
3. **Sensor Pins**: Adjust pins according to your ESP8266 setup
4. **Libraries**:
   - WiFi (built-in)
   - HTTPClient (built-in)
   - ArduinoJson (install via Arduino IDE Library Manager)
   - DHT (if using DHT sensor)

## Pins Used:
- D0 (GPIO16) - Servo
- D1 (GPIO5) - LED
- D2 (GPIO4) - Buzzer
- D3 (GPIO0) - Servo (alternate)
- D4 (GPIO2) - DHT
- D5 (GPIO14) - Ultrasonic Trigger
- D6 (GPIO12) - Ultrasonic Echo

## Testing:

1. Upload this code to your ESP8266
2. Open Serial Monitor (115200 baud)
3. Verify WiFi connection and IP address
4. Check sensor data being sent to backend
5. Monitor backend responses

## Troubleshooting:

- **WiFi not connecting**: Check SSID/password and WiFi signal
- **Backend errors**: Ensure backend is running and IP is correct
- **JSON errors**: Check ArduinoJson library is installed
- **Sensor issues**: Verify pin assignments and sensor connections
