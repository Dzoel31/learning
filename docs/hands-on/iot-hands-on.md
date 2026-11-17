# Hands-On IoT

Untuk rangkaian HC-SR04 di halaman ini, periksa level TRIG dan ECHO sebelum memberi daya. Gunakan penyesuai level pada ECHO jika keluaran modul melebihi batas GPIO ESP32. Lihat [cara membaca HC-SR04](../iot/sensors.md#ultrasonic-sensor-hc-sr04).

## Rangkaian Pemantau Suhu dan Kelembapan

Alat-alat:

- [ESP32](../iot/microcontrollers.md#esp32-devkit-v1)
- [Sensor DHT11](../iot/sensors.md#sensor-dht11)
- [Buzzer](../iot/actuators.md#buzzer)

??? example "Kode program untuk ESP32"
    ```cpp
    --8<-- "ino/pemantau_suhu.ino"
    ```

## Rangkaian Kontrol Aktuator Dengan Relay

Uji relay tanpa pompa lebih dahulu. Cocokkan level aktif modul dengan kode dan amati keadaan relay ketika ESP32 direset. Setelah itu pakai pompa DC tegangan rendah dengan catu yang sesuai.

Alat-alat:

- [ESP32](../iot/microcontrollers.md#esp32-devkit-v1)
- [Relay](../iot/actuators.md#relay-module)
- [Pompa DC](../iot/actuators.md#pompa-dc-mini-submersible-water-pump)

??? example "Kode program untuk ESP32"
    ```cpp
    --8<-- "ino/kontrol_aktuator_relay_pompa.ino"
    ```

## Rangkaian Kontrol Aktuator Pompa DC Dengan Relay

Baca A0 pada GPIO34. Dengan pompa dilepas, catat hasil ADC pada tanah kering dan lembap, lalu ganti `ADC_DRY` dan `ADC_WET` dalam kode. Nilai persen yang ditampilkan memakai skala dua titik ini. Periksa keadaan relay di bawah 30% dan di atas 45% sebelum menyambungkan pompa. Di antara kedua batas, kode mempertahankan keadaan sebelumnya.

Alat-alat:

- [ESP32](../iot/microcontrollers.md#esp32-devkit-v1)
- [Relay](../iot/actuators.md#relay-module)
- [Pompa DC](../iot/actuators.md#pompa-dc-mini-submersible-water-pump)
- [Moisture Sensor](../iot/sensors.md#soil-moisture-sensor)

??? example "Kode program untuk ESP32"
    ```cpp
    --8<-- "ino/aktuator_relay_pompa_moisture.ino"
    ```

## Rangkaian Sensor Ultrasonic dan Buzzer

Buka Serial Monitor pada 115200 baud. Dekatkan dan jauhkan objek, lalu bandingkan angka jarak dengan posisi objek. Jika tidak ada pulsa ECHO sampai batas waktu, kode menampilkan “Jarak tidak terbaca”.

Alat-alat:

- [ESP32](../iot/microcontrollers.md#esp32-devkit-v1)
- [Sensor Ultrasonic](../iot/sensors.md#ultrasonic-sensor-hc-sr04)
- [Buzzer](../iot/actuators.md#buzzer)

??? example "Kode program untuk ESP32"
    ```cpp
    --8<-- "ino/buzzer_ultrasonic.ino"
    ```

## Rangkaian Sensor Ultrasonic, Buzzer, dan Penyimpanan Data di Server

Alat-alat:

- [ESP32](../iot/microcontrollers.md#esp32-devkit-v1)
- [Sensor Ultrasonic](../iot/sensors.md#ultrasonic-sensor-hc-sr04)
- [Buzzer](../iot/actuators.md#buzzer)

??? example "Kode program untuk ESP32"
    ```cpp
    --8<-- "ino/sensor_buzzer_wifi.ino"
    ```

??? example "Kode program untuk server (Python) tanpa penyimpanan data ke database"
    ```python
    --8<-- "python/example_server2.py"
    ```

??? example "Kode program untuk server (Python) dengan penyimpanan data ke database PostgreSQL"
    ```python
    --8<-- "python/example_postgres_server.py"
    ```

??? example "Kode program untuk client (Python) untuk mengambil data dari server"
    ```python
    --8<-- "python/example_client_get.py"
    ```

??? example "Kode program untuk client (Python) untuk mengirim data ke server"
    ```python
    --8<-- "python/example_client_post.py"
    ```

## Blynk Sensor Ultrasonic dan Buzzer

Alat-alat:

- [ESP32](../iot/microcontrollers.md#esp32-devkit-v1)
- [Sensor Ultrasonic](../iot/sensors.md#ultrasonic-sensor-hc-sr04)
- [Buzzer](../iot/actuators.md#buzzer)

??? example "Kode program untuk ESP32"
    ```cpp
    --8<-- "ino/blynk_buzzer_ultrasonic.ino"
    ```
