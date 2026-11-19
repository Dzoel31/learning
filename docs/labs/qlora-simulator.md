# Kalkulator VRAM dan Simulasi LoRA/QLoRA

Atur ukuran model, GPU, panjang sequence, dan micro-batch untuk memperkirakan kebutuhan memori. Setelah itu, jalankan simulasi matriks secara manual atau otomatis untuk mengikuti pembaruan adapter LoRA.

<div class="ai-tour" data-ai-tour="lora">
  <noscript>Simulator memerlukan JavaScript. LoRA memperbarui matriks adapter A dan B, sementara bobot dasar tetap beku.</noscript>
</div>

Estimasi menunjukkan kebutuhan VRAM per GPU dan memakai pendekatan untuk bobot serta aktivasi, bukan pengukuran runtime. Pada Kaggle T4 × 2, kapasitas tiap GPU tetap 16 GB. Ketersediaan GPU Colab dapat berubah, jadi cocokkan estimasi dengan runtime yang diperoleh.

Simulasi matriks 2 × 2 adalah ilustrasi matematika, bukan training model LLM. Bobot dasar \(W_0\) tetap beku; langkah SGD memperbarui A dan B serta menghitung prediksi dan MSE.

[Kembali ke materi Fine-tuning](../ai/ai-systems/fine-tuning.md)
