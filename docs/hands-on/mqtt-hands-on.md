# MQTT hands-on

## MQTT dengan Sensor Ultrasonic dan Buzzer

Alat-alat:

- [ESP32](../iot/microcontrollers.md#esp32-devkit-v1)
- [Sensor Ultrasonic](../iot/sensors.md#ultrasonic-sensor-hc-sr04)
- [Buzzer](../iot/actuators.md#buzzer)

Gunakan broker MQTT latihan di jaringan lokal tepercaya. Siapkan pustaka PubSubClient dan isi konfigurasi Wi-Fi, alamat broker, dan port pada kode. Contoh memakai MQTT tanpa TLS untuk LAN. Pakai broker dan topik khusus latihan agar kirimanmu tidak mengendalikan perangkat lain.

Periksa [level sinyal HC-SR04](../iot/sensors.md#ultrasonic-sensor-hc-sr04) sebelum memasang ECHO ke ESP32. Buka Serial Monitor pada 115200 baud. Setelah tampil `Connected!`, gunakan klien MQTT untuk berlangganan `sensor/jarak` dan `sensor/status`. Gerakkan objek dan cocokkan pesan jarak dalam cm dengan angka di Serial Monitor. Tanpa pantulan, kode melewati pengiriman jarak dan mengirim status “JARAK TIDAK TERBACA” dalam mode otomatis.

Untuk memeriksa arah sebaliknya, kirim `ON` dan `OFF` ke `kontrol/buzzer`. Kirim `AUTO` ke `kontrol/mode` untuk mengembalikan kendali ke pembacaan jarak.

??? example "Kode program untuk ESP32"
    ```cpp
    --8<-- "ino/mqtt_buzzer_jarak.ino"
    ```
