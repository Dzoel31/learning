#include <WiFi.h>
#include <PubSubClient.h>

// ================= WIFI =================
const char* ssid = "nama wifi";
const char* password = "pw wifi";

// ================= MQTT =================
const char* mqtt_server = "192.168.1.10"; // Ganti dengan alamat broker latihan di LAN.
const int mqtt_port = 1883;
const char* mqtt_user = "";
const char* mqtt_pass = "";

// ================= PIN =================
#define TRIG_PIN 5
#define ECHO_PIN 18
#define BUZZER_PIN 19

// ================= MQTT CLIENT =================
WiFiClient espClient;
PubSubClient client(espClient);

// ================= PARAMETER =================
const float JARAK_MINIMUM = 10.0;

unsigned long sebelumnya = 0;
const unsigned long intervalPembacaan = 2000;
bool modeManual = false;

// ================= WIFI =================
void setup_wifi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
}

// ================= CALLBACK MQTT =================
void callback(char* topic, byte* payload, unsigned int length) {
  String msg;

  for (int i = 0; i < length; i++) {
    msg += (char)payload[i];
  }

  if (String(topic) == "kontrol/buzzer") {
    if (msg == "ON") {
      modeManual = true;
      tone(BUZZER_PIN, 500);
    } else if (msg == "OFF") {
      modeManual = true;
      noTone(BUZZER_PIN);
    }
  }

  if (String(topic) == "kontrol/mode") {
    if (msg == "AUTO") {
      modeManual = false;
    }
  }
}

// ================= RECONNECT MQTT =================
void reconnect() {
  const String clientId = "ESP32-" + WiFi.macAddress();
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");

    const bool connected = mqtt_user[0]
      ? client.connect(clientId.c_str(), mqtt_user, mqtt_pass)
      : client.connect(clientId.c_str());
    if (connected) {
      Serial.println("Connected!");

      client.subscribe("kontrol/buzzer");
      client.subscribe("kontrol/mode");

    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" coba lagi 5 detik");
      delay(5000);
    }
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  setup_wifi();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// ================= LOOP =================
void loop() {
  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  unsigned long sekarang = millis();

  if (sekarang - sebelumnya >= intervalPembacaan) {
    sebelumnya = sekarang;

    // Trigger ultrasonik
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    const unsigned long durasi = pulseIn(ECHO_PIN, HIGH, 30000UL);
    if (durasi == 0) {
      Serial.println("Jarak tidak terbaca");
      if (!modeManual) {
        noTone(BUZZER_PIN);
        client.publish("sensor/status", "JARAK TIDAK TERBACA");
      }
      return;
    }
    const float jarak = durasi * 0.034 / 2;

    Serial.print("Jarak: ");
    Serial.print(jarak);
    Serial.println(" cm");

    // ================= MQTT PUBLISH =================
    char msg[10];
    snprintf(msg, sizeof(msg), "%.2f", jarak);
    client.publish("sensor/jarak", msg);

    // ================= LOGIKA BUZZER =================
    if (!modeManual) {
      if (jarak < JARAK_MINIMUM && jarak > 0) {
        tone(BUZZER_PIN, 500);
        client.publish("sensor/status", "NYALA, TERDETEKSI OBJEK");
      } else {
        noTone(BUZZER_PIN);
        client.publish("sensor/status", "MATI, TIDAK ADA OBJEK");
      }
    }
  }
}
