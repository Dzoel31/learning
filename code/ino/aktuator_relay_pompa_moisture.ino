#define MOISTURE_PIN 34
#define RELAY_PIN 18

int moistureAnalog = 0;
int moisture = 0;

#define MOISTURE_ON 30
#define MOISTURE_OFF 45
constexpr int ADC_DRY = 3000; // Contoh: ganti dengan hasil ukur tanah kering.
constexpr int ADC_WET = 1500; // Contoh: ganti dengan hasil ukur tanah lembap.
static_assert(ADC_DRY != ADC_WET, "Kalibrasi perlu dua hasil ukur berbeda");

void readMoistureSensor() {
    moistureAnalog = analogRead(MOISTURE_PIN);
    moisture = (moistureAnalog - ADC_DRY) * 100L / (ADC_WET - ADC_DRY);
    moisture = constrain(moisture, 0, 100);
}

void setup() {
    Serial.begin(115200);
    analogReadResolution(12);
    pinMode(MOISTURE_PIN, INPUT);
    pinMode(RELAY_PIN, OUTPUT);

    digitalWrite(RELAY_PIN, HIGH); // Pastikan relay dalam keadaan mati (HIGH)
    Serial.println("=== Sistem Kontrol Pompa Berbasis Moisture (%) ===");
}

void loop() {

    readMoistureSensor();
    Serial.print("Moisture Analog: ");
    Serial.print(moistureAnalog);
    Serial.print(" | Skala kalibrasi (%): ");
    Serial.print(moisture);
    Serial.println(" %");

    if (moisture < MOISTURE_ON) {
        Serial.println("Tanah Kering -> Pompa MENYALA");
        digitalWrite(RELAY_PIN, LOW); // Relay aktif (LOW)
    } else if (moisture > MOISTURE_OFF) {
        Serial.println("Tanah Lembap -> Pompa MATI");
        digitalWrite(RELAY_PIN, HIGH); // Relay mati (HIGH)
    }
    Serial.println("-----------------------------------");
    delay(2000); // Delay untuk pembacaan berikutnya
}
