# Supervised Learning

Supervised learning melatih model memakai pasangan input dan target. Contohnya, satu baris data berisi suhu, kelembapan, dan pH sebagai input; label `kering` menjadi targetnya. Model mempelajari hubungan dari contoh tersebut, lalu memperkirakan target untuk data baru.

```mermaid
flowchart LR
    A[Input dan target] --> B[Model membuat prediksi]
    B --> C[Hitung kesalahan]
    C --> D[Perbarui parameter]
    D --> B
```

## Regresi linear

Regresi digunakan ketika target berupa angka, seperti suhu satu jam ke depan atau konsumsi energi. Untuk satu fitur, garis regresinya berbentuk:

$$
\hat{y} = wx + b
$$

`w` menentukan kemiringan garis, sedangkan `b` menentukan titik potongnya. Jika sebuah model menghasilkan `\hat{y} = 0{,}8x + 6` dan suhu saat ini `x = 30`, prediksi suhu berikutnya adalah `0{,}8(30) + 6 = 30 °C`.

Model memilih nilai `w` dan `b` agar prediksinya dekat dengan target. Salah satu ukuran kesalahannya adalah mean squared error (MSE):

$$
\operatorname{MSE} = \frac{1}{N}\sum_{i=1}^{N}(y_i - \hat{y}_i)^2
$$

Jika targetnya `30 °C` dan prediksi `29 °C`, error kuadratnya `1`. Jika prediksi `27 °C`, error kuadratnya `9`; karena dikuadratkan, kesalahan yang jauh mendapat penalti lebih besar.

![Ilustrasi garis regresi yang mendekati titik data suhu](../../assets/images/ml-regression.svg)

Regresi linear berguna sebagai baseline yang mudah dibaca. Hubungan yang melengkung atau dipengaruhi banyak interaksi fitur mungkin memerlukan model lain.

## Logistic regression

Logistic regression memperkirakan probabilitas kelas. Walaupun namanya “regression”, penggunaan umumnya adalah klasifikasi. Model menghitung skor linear `z = wᵀx + b`, lalu mengubahnya menjadi probabilitas dengan fungsi sigmoid:

$$
p(y=1 \mid x) = \sigma(z) = \frac{1}{1 + e^{-z}}
$$

Misalnya `z = 1`, maka `σ(1) ≈ 0{,}73`. Dengan threshold `0{,}5`, model memilih kelas positif. Untuk mendeteksi kondisi kering, kelas positif dapat berarti `kering`. Threshold dapat dinaikkan jika alarm palsu mahal, atau diturunkan jika kondisi kering yang terlewat lebih berbahaya.

Untuk beberapa kelas, softmax mengubah skor menjadi probabilitas yang jumlahnya satu:

$$
p(y=k \mid x) = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}}
$$

Untuk klasifikasi biner, cross entropy rata-rata mengukur apakah probabilitas besar diberikan kepada kelas yang benar:

$$
L = -\frac{1}{N}\sum_{i=1}^{N}\left[y_i\log(p_i)+(1-y_i)\log(1-p_i)\right]
$$

Jika target `kering` bernilai `1`, model mendapat loss besar saat probabilitas kelas kering kecil.

## K-Nearest Neighbors (KNN)

KNN menyimpan data latih. Untuk mengklasifikasikan sampel baru, model mencari `k` titik terdekat lalu memilih kelas yang paling sering muncul di antara tetangganya.

![Ilustrasi klasifikasi KNN dengan tetangga terdekat](../../assets/images/ml-knn.svg)

Jarak Euclidean antara dua data dengan fitur `d` adalah:

$$
d(x, x_i) = \sqrt{\sum_{j=1}^{m}(x_j - x_{ij})^2}
$$

Sebagai contoh, untuk titik baru `(kelembapan=6, suhu=28)` dan titik latih `(5, 30)`, jaraknya `√((6−5)² + (28−30)²) = √5 ≈ 2{,}24`. KNN mengurutkan semua jarak dan mengambil `k` yang terkecil. Nilai `k=1` mudah terpengaruh noise; nilai terlalu besar dapat mengaburkan batas kelas.

Skala fitur perlu diperiksa sebelum menghitung jarak. Selisih suhu puluhan derajat dapat mendominasi kelembapan yang rentangnya hanya 0–1. Standardisasi membantu membuat kontribusi fitur lebih sebanding.

## Decision Tree

Decision tree mengajukan pertanyaan berurutan tentang fitur. Setiap cabang membatasi data ke kelompok yang lebih kecil, dan daun menghasilkan kelas atau angka prediksi.

![Ilustrasi pohon keputusan untuk kondisi kelembapan tanah](../../assets/images/ml-decision-tree.svg)

Untuk klasifikasi, salah satu ukuran ketidakmurnian sebuah node adalah Gini:

$$
Gini = 1 - \sum_{k=1}^{K} p_k^2
$$

Jika node berisi 8 sampel `kering` dan 2 sampel `normal`, maka `Gini = 1 − (0{,}8² + 0{,}2²) = 0{,}32`. Pemisahan yang baik menghasilkan anak node dengan ketidakmurnian lebih rendah. Model memilih pertanyaan yang paling mengurangi ketidakmurnian tersebut.

Pohon mudah dijelaskan, tetapi pohon yang terlalu dalam dapat menghafal data latih. Batasi kedalaman atau jumlah sampel minimum per daun, lalu ukur kinerjanya pada data yang tidak dipakai untuk training.

## Support Vector Machine (SVM)

SVM mencari batas yang memisahkan kelas dengan margin selebar mungkin. Titik terdekat ke batas disebut support vector; titik-titik inilah yang paling menentukan posisi batas.

Untuk batas linear, model mencari `w` dan `b` dengan margin besar sambil mengizinkan sebagian kesalahan:

$$
\min_{w,b,\xi}\; \frac{1}{2}\lVert w\rVert^2 + C\sum_i \xi_i
\quad\text{dengan}\quad y_i(w^T x_i+b) \geq 1-\xi_i,\; \xi_i\geq0
$$

Persamaan batasnya adalah `wᵀx + b = 0`, dan lebar margin berbanding terbalik dengan `||w||`. `ξ_i` mengukur pelanggaran margin; `C` mengatur kompromi antara margin lebar dan kesalahan training. Kernel memungkinkan SVM membentuk batas non-linear dengan menghitung kemiripan tanpa membuat fitur baru secara eksplisit.

![Ilustrasi margin dan support vector pada SVM](../../assets/images/ml-svm.svg)

SVM dapat bekerja baik pada dataset kecil atau menengah dengan batas kelas yang jelas. Pemilihan kernel dan parameter perlu diuji, dan model dapat menjadi berat ketika jumlah sampel sangat besar.

## Memilih algoritma

Mulai dengan baseline sederhana. Regresi linear cocok untuk target angka dan hubungan yang mendekati linear; logistic regression memberi probabilitas kelas; KNN berguna untuk melihat pengaruh tetangga; decision tree mudah dijelaskan; SVM mencari margin pemisah. Bandingkan model pada pembagian data dan metrik yang sama. Untuk data berurutan, pisahkan berdasarkan waktu agar data masa depan tidak masuk ke training.

[Kembali ke Machine Learning](overview.md)
