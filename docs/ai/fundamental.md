# AI Fundamental

!!! Note

    ```
    Halaman ini sedang dalam tahap pengembangan. Materi dan struktur masih dapat berubah mengikuti feedback peserta, kebutuhan pembelajaran, dan kebutuhan proyek KSM AIoT.
    ```

## Tujuan

Membangun pemahaman dasar mengenai Artificial Intelligence sebagai teknologi untuk membuat sistem mampu mengambil keputusan, mengenali pola, memahami informasi, atau menghasilkan keluaran berdasarkan aturan maupun pengetahuan yang tersedia.

Materi ini menjadi fondasi sebelum peserta mempelajari Machine Learning, Deep Learning, Computer Vision, RAG, dan teknologi AI lainnya.

## Prasyarat

* Dasar pemrograman Python
* Logika pemrograman dasar
* Kemampuan membaca dan memahami data sederhana
* Tidak diperlukan pengalaman Machine Learning

## Capaian Belajar

Setelah menyelesaikan materi ini, peserta diharapkan mampu:

* Menjelaskan konsep dasar Artificial Intelligence.
* Membedakan AI, Machine Learning, dan Deep Learning.
* Memahami bagaimana AI menjadi bagian dari sebuah sistem.
* Membedakan sistem berbasis aturan dengan sistem berbasis pembelajaran.
* Mengidentifikasi masalah yang sesuai untuk diselesaikan menggunakan AI.
* Memahami peran data, model, inference, dan feedback dalam sistem AI.
* Menjelaskan keterkaitan AI dengan sistem IoT.
* Mempertimbangkan aspek keterbatasan dan penggunaan AI secara bertanggung jawab.

## Materi Inti

### 1. Mengenal Artificial Intelligence

* Apa itu Artificial Intelligence?
* AI sebagai sistem yang melakukan tugas yang membutuhkan kemampuan "cerdas".
* Contoh AI dalam kehidupan sehari-hari.
* AI sebagai teknologi, bukan sekadar chatbot.
* Perbedaan AI tradisional dan AI modern.

### 2. AI, Machine Learning, dan Deep Learning

* Artificial Intelligence sebagai konsep yang lebih luas.
* Machine Learning sebagai pendekatan untuk membangun sistem AI.
* Deep Learning sebagai pendekatan berbasis neural network.
* Generative AI dan Large Language Model sebagai perkembangan AI modern.
* Hubungan AI → ML → DL → Generative AI.

### 3. Bagaimana Sistem AI Bekerja

* Input → Processing → Output.
* Data dan informasi sebagai input.
* Knowledge dan model sebagai dasar pengambilan keputusan.
* Training dan inference.
* Prediction, classification, generation, dan recommendation.
* Feedback dan perbaikan sistem.

### 4. Rule-Based vs Learning-Based

* Sistem berbasis aturan.
* Contoh: threshold sensor.
* Kelebihan dan keterbatasan rule-based system.
* Sistem berbasis Machine Learning.
* Kapan menggunakan rule-based?
* Kapan menggunakan Machine Learning?
* AI tidak selalu berarti menggunakan model yang kompleks.

### 5. AI dalam Sistem IoT

* Sensor sebagai sumber informasi.

* Data sensor sebagai input AI.

* AI sebagai layer analitik dan pengambilan keputusan.

* Actuator sebagai salah satu bentuk output.

* Gambaran pipeline:

  `Sensor → Data → AI → Decision → Actuator`

* Contoh penerapan:

  * Deteksi kondisi tanaman.
  * Prediksi kebutuhan air.
  * Deteksi anomali lingkungan.
  * Klasifikasi kondisi perangkat.
  * Analisis kualitas lingkungan.

### 6. Mengenal Komponen AI System

* Data
* Model
* Inference
* Prompt dan context
* Knowledge base
* Retrieval
* Tools
* Feedback

Peserta diperkenalkan bahwa sistem AI modern dapat terdiri dari lebih dari sekadar sebuah model.

### 7. Memilih Masalah yang Tepat untuk AI

* Identifikasi masalah.
* Tentukan input dan output.
* Tentukan siapa atau apa yang menerima output.
* Bedakan masalah yang membutuhkan AI dan yang cukup diselesaikan dengan aturan sederhana.
* Pertimbangkan ketersediaan data dan sumber daya.
* Pertimbangkan kebutuhan real-time dan deployment.

### 8. Dasar Responsible AI

* Akurasi dan keterbatasan sistem.
* Bias dan kualitas data.
* Hallucination pada Generative AI.
* Privasi data.
* Human-in-the-loop.
* AI sebagai alat bantu, bukan sumber kebenaran mutlak.

## Hands-on

### Mini Project: Merancang Sistem AI

Peserta memilih satu permasalahan sederhana yang berkaitan dengan lingkungan, IoT, atau kehidupan sehari-hari.

1. Identifikasi masalah.
2. Tentukan input dan output sistem.
3. Tentukan apakah solusi menggunakan rule-based atau AI.
4. Buat diagram sederhana arsitektur sistem.
5. Tentukan data atau knowledge yang dibutuhkan.
6. Tentukan bagaimana output sistem digunakan.
7. Presentasikan rancangan sistem.

### Contoh

`Sensor → Backend → AI Model → Decision → Dashboard / Actuator`

Peserta **belum diwajibkan membuat model Machine Learning** pada tahap ini.

## Error Umum dan Debug

* Menganggap semua masalah harus diselesaikan menggunakan AI.
* Langsung menggunakan model kompleks tanpa memahami masalah.
* Menganggap AI selalu menghasilkan jawaban yang benar.
* Tidak menentukan input dan output dengan jelas.
* Mengabaikan kebutuhan deployment dan keterbatasan perangkat.
* Menggunakan data tanpa memahami konteksnya.

## Checklist Selesai

* [ ] Memahami konsep dasar AI.
* [ ] Dapat menjelaskan hubungan AI, ML, dan DL.
* [ ] Memahami perbedaan training dan inference.
* [ ] Dapat membedakan rule-based dan learning-based system.
* [ ] Dapat mengidentifikasi use case AI.
* [ ] Memahami posisi AI dalam arsitektur IoT.
* [ ] Dapat merancang pipeline AI sederhana.
* [ ] Memahami keterbatasan dasar sistem AI.
* [ ] Memiliki rancangan mini project AI.

[Kembali ke Overview AI](overview.md)
