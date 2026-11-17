// Self-contained practice cards; simulator state remains owned by each lab.
const lessons = {
  pin: [
    ["Kenali board", "Pilih ESP32 DevKit V1, lalu klik GPIO34. Buka catatan pin dan bandingkan dengan GPIO27.", "GPIO34 cocok untuk apa?", ["Membaca sensor analog", "Menggerakkan relay sebagai output", "Menghasilkan PWM"], 0, "GPIO34 adalah ADC1 dan input-only. GPIO27 dapat menjadi output, tetapi ADC2-nya berbenturan dengan Wi-Fi."],
    ["Perbaiki konflik", "Buka Perencanaan & konflik → Coba konflik pada ESP32. Pindahkan sensor analog dari GPIO25 ke GPIO34.", "Mengapa konflik pembacaan analog hilang?", ["Wi-Fi dimatikan otomatis", "GPIO34 memakai ADC1", "Semua GPIO mendukung ADC saat Wi-Fi aktif"], 1, "ADC1 tetap tersedia ketika Wi-Fi aktif. Pemilihan pin harus memenuhi fungsi dan batasan periferal."],
    ["Periksa bus", "Pilih Arduino Uno. Klik SDA lalu A4 dan bandingkan catatannya.", "Apakah SDA dan A4 dua jalur independen?", ["Ya, karena label berbeda", "Tidak, keduanya berbagi jalur"], 1, "Label header dapat berbeda untuk jalur fisik yang sama. Jangan mengalokasikan A4 dan SDA untuk dua sinyal berbeda."],
  ],
  neuron: [
    ["Ikuti satu update", "Pilih Normal seimbang. Catat MSE, klik Langkah gradient descent sekali, lalu bandingkan bobot dan MSE.", "Apa yang diperbarui oleh tombol training?", ["Input dan target", "Bobot dan bias", "Hanya aktivasi"], 1, "Input dan target tetap; gradien MSE digunakan untuk memperbarui bobot dan bias semua neuron."],
    ["Selidiki Dead ReLU", "Pilih Dead ReLU. Amati N₁ dan lakukan satu update. Ganti aktivasi menjadi Leaky ReLU dan ulangi.", "Mengapa bobot N₁ tidak berubah saat ReLU?", ["Target sudah tercapai", "Learning rate selalu nol", "Turunan ReLU nol pada z negatif"], 2, "Error dapat tetap besar meski gradien nol. Leaky ReLU memberi kemiringan 0,01 di sisi negatif."],
    ["Selidiki saturasi", "Pilih Saturasi sigmoid. Bandingkan error dengan nilai f′(z) dan perubahan bobot.", "Apakah error besar selalu menghasilkan update besar?", ["Tidak, turunan aktivasi juga berpengaruh", "Ya, hanya error yang menentukan"], 0, "Gradien mengikuti aturan rantai. Turunan sigmoid yang sangat kecil dapat membuat update kecil meski prediksi salah."],
  ],
  lora: [
    ["Bandingkan memori", "Catat estimasi awal. Gandakan micro-batch, lalu bandingkan bagian base dengan aktivasi + workspace.", "Bagian mana yang meningkat saat micro-batch naik?", ["Jumlah parameter base", "Aktivasi", "Kapasitas GPU"], 1, "Estimator menaikkan memori aktivasi sesuai micro-batch. Ukuran bobot base tetap."],
    ["Update adapter pertama", "Reset simulasi training. Catat A, B, W₀; jalankan satu langkah dan periksa gradien.", "Mengapa A tetap pada update pertama?", ["A tidak pernah dilatih", "W₀ berubah lebih dahulu", "B awal nol sehingga gradien A nol"], 2, "B mulai berubah pada update pertama. Setelah itu gradien A dapat nonnol, sementara W₀ tetap beku."],
    ["Pisahkan dua rank", "Ubah LoRA rank di estimator, lalu Rank demo di simulasi numerik.", "Apa fungsi Rank demo?", ["Mengubah ukuran adapter pada contoh 2 × 2", "Mengubah model LLM yang benar-benar dilatih"], 0, "Rank estimator menghitung perkiraan memori model besar; rank demo mengatur matriks kecil untuk mempelajari matematika LoRA."],
  ],
  rag: [
    ["Lacak sumber", "Pilih pertanyaan cuti. Kunjungi Retriever, Prompt augmenter, lalu LLM & output.", "Apa yang dikirim sebagai konteks ke generator?", ["Hanya skor similarity", "Teks chunk beserta identitas sumber", "Seluruh vector database"], 1, "Retriever mengambil chunk; prompt memuat teks dan metadata agar jawaban dapat ditelusuri ke sumber."],
    ["Bandingkan Top-K", "Pada query yang sama, ubah Top-K dari 1 ke 3. Periksa output Retriever dan Prompt augmenter.", "Apakah lebih banyak chunk menjamin jawaban lebih tepat?", ["Ya, selalu", "Tidak, konteks tambahan bisa tidak relevan"], 1, "Top-K mengatur jumlah kandidat, bukan jaminan bukti. Periksa isi sumber, bukan hanya skornya."],
    ["Bukti tidak tersedia", "Pilih Berapa lama proses persetujuan cuti? Lihat sumber teratas dan output terakhir.", "Mengapa demo menolak memberi durasi persetujuan?", ["Dokumen tidak menyebut durasinya", "Tidak ada dokumen tentang cuti"], 0, "Sumber membahas cuti dan batas pengajuan H-5, tetapi tidak menyebut lama persetujuan. Relevansi topik berbeda dari kecukupan bukti."],
  ],
  async: [
    ["Bandingkan antrean", "Atur I/O A ke 3 detik. Jalankan mode Memblokir, lalu mode Asinkron dengan await.", "Kapan B selesai pada mode asinkron?", ["Detik 2", "Detik 4", "Setelah A selesai"], 0, "B datang pada detik 1 dan membutuhkan 1 detik I/O. Ia selesai pada detik 2 saat A masih menunggu."],
    ["Async yang memblokir", "Pilih Async yang memblokir dan maju sampai detik 1. Perhatikan antrean B dan potongan handler.", "Apakah deklarasi async menghilangkan blocking?", ["Ya, semua kode menjadi paralel", "Tidak, pekerjaan sinkron tetap menahan event loop"], 1, "async mengembalikan Promise. Loop CPU sinkron masih memblokir; await perlu operasi yang benar-benar memberi kesempatan event loop berjalan."],
  ],
};

export function mountPractice(root, topic) {
  const tasks = lessons[topic];
  const panel = document.createElement("section");
  panel.className = "lab-practice";
  panel.setAttribute("aria-label", "Latihan terpandu");
  panel.innerHTML = `<h2>Latihan terpandu</h2><p>Coba instruksi di simulator, lalu cek pemahamanmu. Kamu bebas mengeksplorasi tanpa menyelesaikan latihan.</p><p data-practice-progress role="status">0 / ${tasks.length} checkpoint selesai</p>${tasks.map(([title, action, question, choices], i) => `<details><summary>${i + 1}. ${title}</summary><p>${action}</p><fieldset><legend>${question}</legend>${choices.map((choice, j) => `<label><input type="radio" name="practice-${topic}-${i}" value="${j}"> ${choice}</label>`).join("")}</fieldset><button type="button" data-check="${i}">Cek jawaban</button><p data-feedback="${i}" role="status"></p></details>`).join("")}<button type="button" data-practice-reset>Ulangi checkpoint</button>`;
  const completed = new Set();
  const progress = () => { panel.querySelector("[data-practice-progress]").textContent = `${completed.size} / ${tasks.length} checkpoint selesai`; };
  panel.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-practice-reset")) {
      completed.clear();
      panel.querySelectorAll("input").forEach((input) => { input.checked = false; });
      panel.querySelectorAll("[data-feedback]").forEach((node) => { node.textContent = ""; });
      progress();
      return;
    }
    const index = Number(button.dataset.check);
    const choice = button.closest("details").querySelector("input:checked");
    const feedback = panel.querySelector(`[data-feedback="${index}"]`);
    if (!choice) { feedback.textContent = "Pilih jawaban terlebih dahulu."; return; }
    const correct = Number(choice.value) === tasks[index][4];
    if (correct) completed.add(index);
    else completed.delete(index);
    feedback.textContent = `${correct ? "Benar." : "Belum tepat. Coba lagi."} ${tasks[index][5]}`;
    progress();
  });
  root.after(panel);
}
