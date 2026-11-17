import { mountPractice } from "./lab-practice.mjs";
const fmt = (value) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(value);
const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);

const chunks = [
  { id: "DOC-01-C1", doc: "DOC-01", title: "Kebijakan Cuti & Izin", category: "HRD", page: 1, text: "Karyawan tetap berhak atas 14 hari cuti tahunan berbayar setelah masa kerja 12 bulan. Pengajuan cuti dilakukan minimal H-5 melalui portal HRIS dan disetujui atasan langsung.", vector: [1, .04, .02, .03] },
  { id: "DOC-02-C1", doc: "DOC-02", title: "Spesifikasi Server AI", category: "Infrastruktur", page: 1, text: "Cluster produksi AI menggunakan 4x NVIDIA L40S 48GB VRAM dengan NVLink, RAM 512GB DDR5 ECC, dan storage NVMe RAID-10 8TB untuk inference LLM lokal.", vector: [.02, 1, .06, .01] },
  { id: "DOC-03-C1", doc: "DOC-03", title: "SOP Penanganan Insiden", category: "SRE / DevOps", page: 2, text: "Insiden kritikal tingkat P1 memiliki batas waktu respons maksimal 15 menit. Tim on-call membuka war-room dan mengirim pembaruan status tiap 30 menit.", vector: [.02, .07, 1, .05] },
  { id: "DOC-04-C1", doc: "DOC-04", title: "Panduan Onboarding Dev", category: "Engineering", page: 3, text: "Engineer baru wajib mengaktifkan SSH Key Ed25519 dan Hardware MFA sebelum meminta akses ke repositori GitLab internal serta cluster staging Kubernetes.", vector: [.01, .03, .06, 1] },
];
const queries = [
  { question: "Berapa jatah cuti tahunan dan syarat pengajuannya?", vector: [1, .02, .01, .02], evidence: "DOC-01-C1", answer: "Karyawan tetap mendapat 14 hari cuti tahunan berbayar setelah masa kerja 12 bulan. Pengajuan dilakukan minimal H-5 lewat portal HRIS dan memerlukan persetujuan atasan." },
  { question: "Apa spesifikasi GPU dan memori cluster server AI?", vector: [.02, 1, .03, .01], evidence: "DOC-02-C1", answer: "Cluster produksi memakai 4 GPU NVIDIA L40S 48GB dengan NVLink, RAM 512GB DDR5 ECC, dan storage NVMe RAID-10 8TB." },
  { question: "Berapa SLA respons insiden kritikal P1?", vector: [.01, .02, 1, .04], evidence: "DOC-03-C1", answer: "SLA respons insiden P1 maksimal 15 menit. Tim on-call membuka war-room dan mengirim update tiap 30 menit." },
  { question: "Apa syarat sebelum engineer mendapat akses repo?", vector: [.01, .03, .05, 1], evidence: "DOC-04-C1", answer: "Engineer harus mengaktifkan SSH Key Ed25519 dan Hardware MFA sebelum meminta akses ke GitLab internal dan cluster staging Kubernetes." },
  { question: "Berapa lama proses persetujuan cuti?", vector: [.8, .2, .02, .02], evidence: null },
];
const tours = {};

function mountQlora(root) {
  const state = {
    modelB: 7, gpu: "colab-t4", customVram: 16, rank: 16, demoRank: 2, alpha: 8, learningRate: .1,
    sequenceLength: 1024, microBatch: 1, checkpointing: true, nf4: true, paged: true,
    x: [1, .5], target: [.9, .1], step: 0, history: [], lastUpdate: null,
    A: [[.25, -.1], [.15, .3]], B: [[0, 0], [0, 0]], timer: null,
  };
  const ranks = [4, 8, 16, 32, 64];
  const gpuProfiles = {
    "colab-t4": { label: "Google Colab · T4", count: 1, perGpu: 16, memoryType: "vram" },
    "kaggle-t4x2": { label: "Kaggle · T4 × 2", count: 2, perGpu: 16, memoryType: "vram" },
    "rtx-3060": { label: "GeForce RTX 3060", count: 1, perGpu: 12, memoryType: "vram" },
    "rtx-3090": { label: "GeForce RTX 3090", count: 1, perGpu: 24, memoryType: "vram" },
    "rtx-4060": { label: "GeForce RTX 4060", count: 1, perGpu: 8, memoryType: "vram" },
    "rtx-4060ti16": { label: "GeForce RTX 4060 Ti · 16 GB", count: 1, perGpu: 16, memoryType: "vram" },
    "rtx-4070": { label: "GeForce RTX 4070", count: 1, perGpu: 12, memoryType: "vram" },
    "rtx-4080s": { label: "GeForce RTX 4080 SUPER", count: 1, perGpu: 16, memoryType: "vram" },
    "rtx-4090": { label: "GeForce RTX 4090", count: 1, perGpu: 24, memoryType: "vram" },
    "rtx-5060ti16": { label: "GeForce RTX 5060 Ti · 16 GB", count: 1, perGpu: 16, memoryType: "vram" },
    "rtx-5070": { label: "GeForce RTX 5070", count: 1, perGpu: 12, memoryType: "vram" },
    "rtx-5070ti": { label: "GeForce RTX 5070 Ti", count: 1, perGpu: 16, memoryType: "vram" },
    "rtx-5080": { label: "GeForce RTX 5080", count: 1, perGpu: 16, memoryType: "vram" },
    "rtx-5090": { label: "GeForce RTX 5090", count: 1, perGpu: 32, memoryType: "vram" },
    "pro-4000-ada": { label: "RTX 4000 Ada", count: 1, perGpu: 20, memoryType: "vram" },
    "pro-5000-ada": { label: "RTX 5000 Ada", count: 1, perGpu: 32, memoryType: "vram" },
    "pro-6000-ada": { label: "RTX 6000 Ada", count: 1, perGpu: 48, memoryType: "vram" },
    "pro-4000-bw": { label: "RTX PRO 4000 Blackwell", count: 1, perGpu: 24, memoryType: "vram" },
    "pro-4500-bw": { label: "RTX PRO 4500 Blackwell", count: 1, perGpu: 32, memoryType: "vram" },
    "pro-5000-bw": { label: "RTX PRO 5000 Blackwell", count: 1, perGpu: 48, memoryType: "vram" },
    "pro-5000-bw-72": { label: "RTX PRO 5000 Blackwell · 72 GB", count: 1, perGpu: 72, memoryType: "vram" },
    "pro-5500-bw": { label: "RTX PRO 5500 Blackwell", count: 1, perGpu: 84, memoryType: "vram" },
    "pro-6000-bw": { label: "RTX PRO 6000 Blackwell", count: 1, perGpu: 96, memoryType: "vram" },
    "a100-40": { label: "NVIDIA A100 · 40 GB", count: 1, perGpu: 40, memoryType: "vram" },
    "a100-80": { label: "NVIDIA A100 · 80 GB", count: 1, perGpu: 80, memoryType: "vram" },
    "h100-80": { label: "NVIDIA H100 · 80 GB", count: 1, perGpu: 80, memoryType: "vram" },
    "h200-141": { label: "NVIDIA H200 · 141 GB", count: 1, perGpu: 141, memoryType: "vram" },
    "dgx-spark": { label: "NVIDIA DGX Spark", count: 1, perGpu: 128, memoryType: "unified" },
    custom: { label: "GPU kustom", count: 1, perGpu: 16, memoryType: "vram" },
  };
  const gpuGroups = [
    ["Cloud notebook", ["colab-t4", "kaggle-t4x2"]],
    ["GeForce RTX 30 Series", ["rtx-3060", "rtx-3090"]],
    ["GeForce RTX 40 Series", ["rtx-4060", "rtx-4060ti16", "rtx-4070", "rtx-4080s", "rtx-4090"]],
    ["GeForce RTX 50 Series", ["rtx-5060ti16", "rtx-5070", "rtx-5070ti", "rtx-5080", "rtx-5090"]],
    ["RTX workstation · Ada", ["pro-4000-ada", "pro-5000-ada", "pro-6000-ada"]],
    ["RTX PRO workstation · Blackwell", ["pro-4000-bw", "pro-4500-bw", "pro-5000-bw", "pro-5000-bw-72", "pro-5500-bw", "pro-6000-bw"]],
    ["Datacenter", ["a100-40", "a100-80", "h100-80", "h200-141"]],
    ["Unified memory system", ["dgx-spark"]],
    ["Custom", ["custom"]],
  ];
  const modelAnchors = [[.5, 1024, 16], [1, 1536, 24], [3, 3072, 32], [7, 4096, 32], [13, 5120, 40], [34, 8192, 60], [70, 8192, 80]];
  const fmtNum = (n, digits = 3) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: digits }).format(n);
  const resetAdapter = () => {
    state.A = state.demoRank === 1 ? [[.25, -.1]] : [[.25, -.1], [.15, .3]];
    state.B = Array.from({ length: 2 }, () => Array(state.demoRank).fill(0));
    state.step = 0;
    state.history = [];
    state.lastUpdate = null;
  };
  const modelShape = (params) => {
    for (let i = 1; i < modelAnchors.length; i++) {
      const prev = modelAnchors[i - 1], next = modelAnchors[i];
      if (params <= next[0]) {
        const t = (params - prev[0]) / (next[0] - prev[0]);
        return { hidden: Math.round(prev[1] + (next[1] - prev[1]) * t), layers: Math.round(prev[2] + (next[2] - prev[2]) * t) };
      }
    }
    return { hidden: 8192, layers: 80 };
  };
  const estimateMemory = () => {
    const shape = modelShape(state.modelB);
    const trainableParams = shape.layers * 7 * 2 * shape.hidden * state.rank;
    const gib = 1e9;
    const base = state.modelB * (state.nf4 ? .55 : 2);
    const adapterAndGrad = trainableParams * 4 / gib;
    const optimizerGpu = state.paged ? .2 : trainableParams * 8 / gib;
    const optimizerCpu = state.paged ? trainableParams * 8 / gib : 0;
    const checkpointFactor = state.checkpointing ? .55 : 1;
    const activation = shape.layers * shape.hidden * state.sequenceLength * state.microBatch * 2 * 6 / gib * checkpointFactor;
    const runtime = .8;
    const qlora = base + adapterAndGrad + optimizerGpu + activation + runtime;
    const full = state.modelB * 16 + activation * 1.5 + runtime;
    const gpu = gpuProfiles[state.gpu];
    const perGpu = state.gpu === "custom" ? state.customVram : gpu.perGpu;
    const usable = perGpu * .9;
    return { shape, trainableParams, base, adapterAndGrad, optimizerGpu, optimizerCpu, activation, runtime, qlora, full, gpu, perGpu, usable };
  };
  const forward = () => {
    const baseWeight = [[.5, .2], [.1, .4]];
    const base = baseWeight.map((row) => dot(row, state.x));
    const hidden = state.A.map((row) => dot(row, state.x));
    const scale = state.alpha / state.demoRank;
    const delta = Array.from({ length: 2 }, (_, j) => state.B[j].reduce((sum, value, k) => sum + value * hidden[k] * scale, 0));
    const output = base.map((value, j) => value + delta[j]);
    const deltaWeight = Array.from({ length: 2 }, (_, j) => Array.from({ length: 2 }, (_, i) => state.A.reduce((sum, row, k) => sum + state.B[j][k] * row[i] * scale, 0)));
    const loss = output.reduce((sum, value, j) => sum + (value - state.target[j]) ** 2, 0) / 2;
    return { base, hidden, delta, output, deltaWeight, loss, scale };
  };
  const trainStep = () => {
    const result = forward();
    const error = result.output.map((value, j) => value - state.target[j]);
    const gradB = Array.from({ length: 2 }, (_, j) => state.B[j].map((_, k) => error[j] * result.scale * result.hidden[k]));
    const gradA = state.A.map((row, k) => row.map((_, i) => error.reduce((sum, e, j) => sum + e * result.scale * state.B[j][k] * state.x[i], 0)));
    const beforeB = state.B.map((row) => [...row]);
    const beforeA = state.A.map((row) => [...row]);
    const nextB = state.B.map((row, j) => row.map((value, k) => value - state.learningRate * gradB[j][k]));
    const nextA = state.A.map((row, k) => row.map((value, i) => value - state.learningRate * gradA[k][i]));
    if ([...nextA.flat(), ...nextB.flat()].some((value) => !Number.isFinite(value) || Math.abs(value) > 1000)) {
      clearInterval(state.timer); state.timer = null;
      state.stopped = true;
      return;
    }
    state.B = nextB;
    state.A = nextA;
    state.step++;
    const after = forward();
    state.history.push(after.loss);
    if (state.history.length > 16) state.history.shift();
    state.lastUpdate = { before: result.loss, after: after.loss, gradA, gradB, beforeB, beforeA };
  };
  const matrixTable = (name, matrix, frozen = false, previous = null) => `<div class="ft-matrix-card${frozen ? " is-frozen" : " is-trainable"}"><header><strong>${name}</strong><span>${matrix.length} × ${matrix[0].length} · ${frozen ? "beku" : "dilatih"}</span></header><div class="ft-matrix-grid" style="--matrix-cols:${matrix[0].length}">${matrix.flat().map((value, i) => `<span class="${previous && Math.abs(value - previous.flat()[i]) > 1e-10 ? "has-changed" : ""}">${fmtNum(value, 4)}</span>`).join("")}</div></div>`;

  root.innerHTML = `<div class="ft-lab">
    <section class="ft-config"><div class="ft-section-title"><div><h2>Konfigurasi &amp; estimasi memori</h2><p>Ubah model, adapter, panjang konteks, dan GPU.</p></div><span class="ft-estimate-badge">Estimasi</span></div>
      <div class="ft-config-grid"><div class="ft-controls">
        <label class="ft-slider-label"><span>Ukuran model <output data-model-label>7B</output></span><input type="range" min="0.5" max="70" step="0.5" value="7" data-model-size><small>Parameter model dalam miliar.</small></label>
        <label>GPU <select data-gpu>${gpuGroups.map(([group, keys]) => `<optgroup label="${group}">${keys.map((key) => { const profile = gpuProfiles[key]; return `<option value="${key}">${profile.label}${profile.count > 1 ? " · 2 × 16 GB" : profile.memoryType === "unified" ? " · 128 GB unified" : ` · ${profile.perGpu} GB`}</option>`; }).join("")}</optgroup>`).join("")}</select></label>
        <label class="ft-custom-vram" data-custom-control hidden>VRAM per GPU <span><input type="range" min="8" max="256" step="4" value="16" data-custom-vram><output data-custom-label>16 GB</output></span></label>
        <div class="ft-inline-controls"><label class="ft-slider-label"><span>LoRA rank <output data-rank-label>r = 16</output></span><input type="range" min="0" max="4" step="1" value="2" data-rank><small>Estimasi memakai rank 4–64.</small></label><label class="ft-slider-label"><span>Alpha <output data-alpha-label>8</output></span><input type="range" min="1" max="16" step="1" value="8" data-alpha><small>Skala adapter: α/r.</small></label></div>
        <label class="ft-slider-label"><span>Panjang sequence <output data-seq-label>1,024 token</output></span><input type="range" min="256" max="4096" step="256" value="1024" data-sequence><small>Lebih panjang membutuhkan lebih banyak aktivasi.</small></label>
        <label class="ft-slider-label"><span>Micro-batch <output data-batch-label>1</output></span><input type="range" min="1" max="4" step="1" value="1" data-batch></label>
        <label class="ft-check"><input type="checkbox" checked data-nf4> Base model disimpan dalam 4-bit NF4</label>
        <label class="ft-check"><input type="checkbox" checked data-paged> Paged optimizer (optimizer state memakai RAM)</label>
        <label class="ft-check"><input type="checkbox" checked data-checkpoint> Gradient checkpointing</label>
      </div><div class="ft-memory" data-memory-view></div></div>
      <p class="ft-assumption">Asumsi estimator: 7 proyeksi linear per layer, aktivasi pendekatan, dan ruang kerja runtime tetap. Arsitektur, kernel, optimizer, dan implementasi training dapat mengubah pemakaian aktual. Pada GPU ganda, kebutuhan ditampilkan per GPU; VRAM tidak otomatis digabung.</p>
      <p class="ft-source-note">Spesifikasi profil: <a href="https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/" target="_blank" rel="noreferrer">GeForce RTX 40</a> · <a href="https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/" target="_blank" rel="noreferrer">GeForce RTX 50</a> · <a href="https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/" target="_blank" rel="noreferrer">RTX workstation / RTX PRO</a> · <a href="https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory-h100-h200-b200/latest/components.html" target="_blank" rel="noreferrer">A100/H100/H200</a> · <a href="https://docs.nvidia.com/dgx/dgx-spark/hardware.html" target="_blank" rel="noreferrer">DGX Spark</a>. GPU yang diberikan Colab bergantung ketersediaan; <a href="https://research.google.com/colaboratory/faq.html" target="_blank" rel="noreferrer">lihat catatan Colab</a>. <a href="https://www.kaggle.com/product-announcements/735239" target="_blank" rel="noreferrer">Kaggle T4 × 2 memiliki 16 GB per GPU</a>.</p>
    </section>
    <section class="ft-training"><div class="ft-section-title"><div><h2>Simulasi training LoRA</h2><p>Contoh numerik 2 × 2. Jalankan satu update SGD dan ikuti perubahan A, B, dan loss.</p></div><div class="ft-run-controls"><button type="button" data-train-step>Langkah training</button><button type="button" data-train-auto>Jalankan otomatis</button><button type="button" data-train-reset>Reset</button></div></div>
      <div class="ft-training-inputs"><label>Rank demo <select data-demo-rank><option value="1">r = 1</option><option value="2" selected>r = 2</option></select></label><label>x₁ <input type="number" step="0.1" value="1" data-x1></label><label>x₂ <input type="number" step="0.1" value="0.5" data-x2></label><label>Target y₁ <input type="number" step="0.1" value="0.9" data-y1></label><label>Target y₂ <input type="number" step="0.1" value="0.1" data-y2></label><label class="ft-slider-label"><span>Learning rate <output data-lr-label>0,10</output></span><input type="range" min="0.01" max="0.2" step="0.01" value="0.1" data-lr></label></div>
      <div class="ft-equation">ŷ = W₀x + (α/r)B(Ax) <span>· loss = MSE(ŷ, y)</span></div><p class="ft-init-note">B dimulai dari nol, jadi output awal sama dengan W₀x. Pada update pertama, B mulai berubah; gradien A baru menjadi nonnol setelah B berubah.</p><div class="ft-matrix-flow" data-matrix-view></div><div class="ft-training-results" data-training-results></div><div class="ft-loss-panel"><div><strong>Loss per langkah</strong><span data-step-count>Langkah 0</span></div><svg viewBox="0 0 320 100" role="img" aria-label="Grafik loss training" data-loss-chart><text x="160" y="54" text-anchor="middle">Belum ada langkah training</text></svg></div><ol class="ft-training-log" data-training-log><li>Belum ada update. Matriks B diinisialisasi nol, sehingga keluaran awal sama dengan base model.</li></ol>
    </section>
  </div>`;

  const output = (selector, value) => { const node = root.querySelector(selector); if (node) node.textContent = value; };
  const updateMemory = () => {
    const m = estimateMemory();
    const cap = m.usable;
    const max = Math.max(m.full, m.qlora, cap, 1);
    const pct = (v) => `${Math.max(1, Math.min(100, v / max * 100))}%`;
    const fits = m.qlora <= cap;
    const fullPerGpu = m.full;
    const trainablePct = m.trainableParams / (state.modelB * 1e9) * 100;
    const profileText = state.gpu === "custom" ? `${fmtNum(state.customVram, 0)} GB VRAM per GPU (kustom)` : m.gpu.memoryType === "unified" ? `${fmtNum(m.perGpu, 0)} GB unified system memory` : `${m.gpu.count > 1 ? `${m.gpu.count} × ` : ""}${fmtNum(m.perGpu, 0)} GB VRAM per GPU`;
    const deviceLabel = m.gpu.memoryType === "unified" ? "Perangkat" : "Per GPU";
    root.querySelector("[data-custom-control]").hidden = state.gpu !== "custom";
    output("[data-model-label]", `${fmtNum(state.modelB, 1)}B`);
    output("[data-custom-label]", `${state.customVram} GB`);
    output("[data-rank-label]", `r = ${state.rank}`);
    output("[data-alpha-label]", String(state.alpha));
    output("[data-seq-label]", `${new Intl.NumberFormat("id-ID").format(state.sequenceLength)} token`);
    output("[data-batch-label]", String(state.microBatch));
    output("[data-lr-label]", fmtNum(state.learningRate, 2));
    root.querySelector("[data-memory-view]").innerHTML = `<div class="ft-memory-heading"><h3>Perkiraan pemakaian ${m.gpu.memoryType === "unified" ? "memori sistem" : "VRAM"}</h3><strong class="${fits ? "is-fit" : "is-over"}">${fits ? `${deviceLabel}: muat menurut estimasi` : `${deviceLabel}: melebihi batas estimasi`}</strong></div><p class="ft-gpu-profile">${m.gpu.label} · ${profileText} · batas kerja dipatok 90% kapasitas</p>
      <div class="ft-memory-row"><div><strong>Full fine-tuning · BF16 + Adam</strong><b>~${fmtNum(fullPerGpu, 1)} GB / ${m.gpu.memoryType === "unified" ? "perangkat" : "GPU"}</b></div><div class="ft-memory-track"><i class="is-full" style="width:${pct(fullPerGpu)}"></i><em style="left:${pct(cap)}" title="Batas kerja perangkat"></em></div></div>
      <div class="ft-memory-row"><div><strong>QLoRA · ${state.nf4 ? "NF4 4-bit" : "base BF16"} · r=${state.rank}</strong><b>~${fmtNum(m.qlora, 1)} GB / ${m.gpu.memoryType === "unified" ? "perangkat" : "GPU"}</b></div><div class="ft-memory-track"><i class="is-qlora" style="width:${pct(m.qlora)}"></i><em style="left:${pct(cap)}" title="Batas kerja perangkat"></em></div></div>
      <div class="ft-memory-breakdown"><span>Base <b>${fmtNum(m.base, 2)} GB</b></span><span>Adapter + gradien <b>${fmtNum(m.adapterAndGrad, 2)} GB</b></span><span>Optimizer di GPU <b>${fmtNum(m.optimizerGpu, 2)} GB</b></span><span>Aktivasi + workspace <b>${fmtNum(m.activation + m.runtime, 2)} GB</b></span>${state.paged ? `<span>Optimizer di RAM <b>${fmtNum(m.optimizerCpu, 2)} GB</b></span>` : ""}</div>
      <p class="ft-fit-note">${fits ? `Sisa perkiraan ${fmtNum(cap - m.qlora, 1)} GB hingga batas kerja.` : `Kurangi model, sequence, atau micro-batch; atau gunakan strategi sharding yang sesuai.`} ${m.gpu.count > 1 ? "Profil dual GPU tetap membandingkan kebutuhan per GPU; estimator tidak membagi model antar-GPU." : ""} ${m.gpu.memoryType === "unified" ? "DGX Spark memakai unified memory, bukan VRAM khusus; kapasitas yang tersedia untuk GPU berbagi dengan sistem." : ""}</p><p class="ft-trainable-note">Adapter terlatih diperkirakan ${new Intl.NumberFormat("id-ID").format(m.trainableParams)} parameter (${fmtNum(trainablePct, 3)}% dari model), dengan asumsi bentuk model pendekatan ${m.shape.layers} layer × hidden ${m.shape.hidden}.</p>`;
  };
  const updateTraining = () => {
    const r = state.rank, forwardState = forward();
    const w0 = [[.5, .2], [.1, .4]];
    const effectiveWeight = w0.map((row, i) => row.map((value, j) => value + forwardState.deltaWeight[i][j]));
    root.querySelector("[data-matrix-view]").innerHTML = `<div class="ft-matrix-equation">${matrixTable("W₀ · beku", w0, true)}<span class="ft-flow-op">+</span>${matrixTable("ΔW = (α/r)BA", forwardState.deltaWeight)}<span class="ft-flow-op">=</span>${matrixTable("W efektif", effectiveWeight)}</div><div class="ft-matrix-equation">${matrixTable("B · dilatih", state.B, false, state.lastUpdate?.beforeB)}<span class="ft-flow-op">×</span>${matrixTable("A · dilatih", state.A, false, state.lastUpdate?.beforeA)}<small>Sel yang berubah disorot.</small></div>`;
    const gradA = state.lastUpdate ? state.lastUpdate.gradA.flat().map((v) => fmtNum(v, 5)).join(", ") : "— (jalankan langkah)";
    const gradB = state.lastUpdate ? state.lastUpdate.gradB.flat().map((v) => fmtNum(v, 5)).join(", ") : "— (jalankan langkah)";
    const lossChange = state.lastUpdate ? `${fmtNum(state.lastUpdate.before, 6)} → ${fmtNum(state.lastUpdate.after, 6)}` : fmtNum(forwardState.loss, 6);
    root.querySelector("[data-training-results]").innerHTML = `<div><span>Ax</span><code>[${forwardState.hidden.map((v) => fmtNum(v, 4)).join(", ")}]</code></div><div><span>W₀x</span><code>[${forwardState.base.map((v) => fmtNum(v, 4)).join(", ")}]</code></div><div><span>Δy</span><code>[${forwardState.delta.map((v) => fmtNum(v, 4)).join(", ")}]</code></div><div><span>ŷ = W₀x + Δy</span><code>[${forwardState.output.map((v) => fmtNum(v, 4)).join(", ")}]</code></div><div><span>Target y</span><code>[${state.target.map((v) => fmtNum(v, 4)).join(", ")}]</code></div><div><span>MSE loss · sebelum → sesudah update</span><code>${lossChange}</code></div><div><span>Gradien ∇A</span><code>[${gradA}]</code></div><div><span>Gradien ∇B</span><code>[${gradB}]</code></div><small>α/r = ${fmtNum(forwardState.scale, 3)} · W₀ tetap · update SGD ${state.step}</small>`;
    output("[data-step-count]", state.stopped ? "Update terlalu besar. Kecilkan learning rate, lalu Reset." : `Langkah ${state.step}`);
    const chart = root.querySelector("[data-loss-chart]");
    if (state.history.length) {
      const values = [...state.history];
      const max = Math.max(...values, .0001);
      const points = values.map((loss, i) => `${12 + i * (296 / Math.max(1, values.length - 1))},${88 - loss / max * 70}`).join(" ");
      const last = values.length - 1;
      const lastX = 12 + last * (296 / Math.max(1, values.length - 1));
      const lastY = 88 - values[last] / max * 70;
      chart.innerHTML = `<line x1="12" y1="88" x2="308" y2="88"/><polyline points="${points}"/><circle cx="${lastX}" cy="${lastY}" r="3"/><text x="12" y="99">${Math.max(0, state.step - values.length + 1)}</text><text x="294" y="99">${state.step}</text>`;
    } else chart.innerHTML = `<text x="160" y="54" text-anchor="middle">Belum ada langkah training</text>`;
    const log = root.querySelector("[data-training-log]");
    log.innerHTML = state.history.length ? state.history.slice(-6).map((loss, index) => `<li>Langkah ${state.step - Math.min(5, state.history.length - 1) + index}: loss ${fmtNum(loss, 6)}</li>`).reverse().join("") : "<li>Belum ada update. B₀ diinisialisasi nol; keluaran awal sama dengan base model.</li>";
    root.querySelector("[data-train-step]").disabled = state.step >= 20 || Boolean(state.stopped);
    root.querySelector("[data-train-auto]").disabled = state.step >= 20 || Boolean(state.stopped);
    root.querySelector("[data-train-auto]").textContent = state.timer ? "Jeda" : state.step >= 20 ? "Batas langkah tercapai" : "Jalankan otomatis";
  };
  const refresh = () => { updateMemory(); updateTraining(); };
  const restartForTrainingSetting = () => { clearInterval(state.timer); state.timer = null; state.stopped = false; resetAdapter(); refresh(); };
  root.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches('input[type="number"]') && (!target.validity.valid || !Number.isFinite(target.valueAsNumber))) return;
    if (target.matches("[data-model-size]")) state.modelB = Number(target.value);
    else if (target.matches("[data-custom-vram]")) state.customVram = Number(target.value);
    else if (target.matches("[data-sequence]")) state.sequenceLength = Number(target.value);
    else if (target.matches("[data-batch]")) state.microBatch = Number(target.value);
    else if (target.matches("[data-nf4]")) state.nf4 = target.checked;
    else if (target.matches("[data-paged]")) state.paged = target.checked;
    else if (target.matches("[data-checkpoint]")) state.checkpointing = target.checked;
    else if (target.matches("[data-rank]")) { state.rank = ranks[Number(target.value)]; updateMemory(); return; }
    else if (target.matches("[data-alpha]")) { state.alpha = Number(target.value); restartForTrainingSetting(); return; }
    else if (target.matches("[data-lr]")) state.learningRate = Number(target.value);
    else if (target.matches("[data-x1]")) { state.x[0] = Number(target.value); restartForTrainingSetting(); return; }
    else if (target.matches("[data-x2]")) { state.x[1] = Number(target.value); restartForTrainingSetting(); return; }
    else if (target.matches("[data-y1]")) { state.target[0] = Number(target.value); restartForTrainingSetting(); return; }
    else if (target.matches("[data-y2]")) { state.target[1] = Number(target.value); restartForTrainingSetting(); return; }
    else return;
    refresh();
  });
  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-gpu]")) { state.gpu = event.target.value; updateMemory(); }
    if (event.target.matches("[data-demo-rank]")) { state.demoRank = Number(event.target.value); restartForTrainingSetting(); }
  });
  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-train-reset")) { restartForTrainingSetting(); return; }
    if (button.hasAttribute("data-train-step")) { clearInterval(state.timer); state.timer = null; trainStep(); updateTraining(); }
    if (button.hasAttribute("data-train-auto")) {
      if (state.timer) { clearInterval(state.timer); state.timer = null; updateTraining(); return; }
      if (state.step >= 20) return;
      state.timer = setInterval(() => {
        if (!root.isConnected || state.step >= 20) { clearInterval(state.timer); state.timer = null; updateTraining(); return; }
        trainStep(); updateTraining();
      }, 650);
      updateTraining();
    }
  });
  refresh();
  root.dataset.ready = "";
}

const ragNodes = [
  { id: 1, title: "Sumber dokumen", lane: "offline", x: 20, y: 74, summary: "4 file · PDF", explanation: "Pilih dokumen yang akan masuk basis pengetahuan. Simulasi memakai empat dokumen internal contoh." },
  { id: 2, title: "OCR / Parser", lane: "offline", x: 242, y: 74, summary: "Ekstrak teks + metadata", explanation: "OCR mengubah halaman scan menjadi teks. Parser membaca teks pada PDF digital. Simpan ID dokumen, halaman, dan kategori." },
  { id: 3, title: "Chunking", lane: "offline", x: 464, y: 74, summary: "Bagi teks jadi potongan", explanation: "Potongan dibuat agar bagian relevan dapat dicari tanpa mengirim seluruh dokumen ke model. Overlap dapat menjaga konteks di batas potongan." },
  { id: 4, title: "Embedding", lane: "offline", x: 686, y: 74, summary: "4 dimensi · ilustrasi", explanation: "Embedder mengubah teks chunk menjadi vektor. Di demo ini setiap angka dibuat tetap untuk memperlihatkan alur, bukan hasil encoder nyata." },
  { id: 5, title: "Vector store", lane: "offline", x: 908, y: 74, summary: "Vektor + chunk + metadata", explanation: "Simpan vektor bersama chunk dan metadata. Pencarian mengembalikan teks sumber, bukan hanya vektor." },
  { id: 6, title: "Query pengguna", lane: "online", x: 20, y: 320, summary: "Pertanyaan masuk", explanation: "Pertanyaan diproses saat pengguna meminta informasi. Indeks dokumen tidak perlu dibuat ulang untuk setiap query." },
  { id: 7, title: "Query embedding", lane: "online", x: 242, y: 320, summary: "Model embedding yang sama", explanation: "Ubah query menjadi vektor memakai model embedding yang sama dengan yang dipakai saat indexing." },
  { id: 8, title: "Retriever", lane: "online", x: 464, y: 320, summary: "Similarity · Top-K", explanation: "Bandingkan query vector dengan vector store, urutkan kandidat, lalu ambil sejumlah chunk teratas (Top-K)." },
  { id: 9, title: "Prompt augmenter", lane: "online", x: 686, y: 320, summary: "System + konteks + query", explanation: "Gabungkan instruksi sistem, chunk hasil retrieval, dan query. Instruksi dapat meminta model menyebutkan sumber serta mengakui bukti yang tidak tersedia." },
  { id: 10, title: "LLM & output", lane: "online", x: 908, y: 320, summary: "Jawaban + sitasi", explanation: "LLM menyusun jawaban memakai prompt augmented. Aplikasi menampilkan sitasi agar pengguna dapat membuka kembali sumber." },
];

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function mountRag(root) {
  const state = { step: 0, selected: 1, count: 2, query: queries[0].question, timer: null };
  const nodeCount = ragNodes.length;
  const matchQuery = () => queries.find((item) => item.question === state.query) ?? {
    question: state.query,
    vector: /cuti|izin|hris/i.test(state.query) ? [1, .03, .02, .02] : /gpu|server|memori|vram/i.test(state.query) ? [.02, 1, .03, .02] : /sla|insiden|p1|war-room/i.test(state.query) ? [.02, .04, 1, .03] : /ssh|mfa|gitlab|engineer/i.test(state.query) ? [.02, .03, .04, 1] : [.25, .25, .25, .25],
    evidence: null,
    answer: "Query kustom hanya mendemonstrasikan retrieval berbasis kata kunci; demo ini tidak memvalidasi jawaban baru.",
  };
  const results = () => {
    const query = matchQuery();
    const cosine = (other) => dot(query.vector, other) / (Math.hypot(...query.vector) * Math.hypot(...other));
    return { query, ranked: chunks.map((chunk) => ({ ...chunk, score: cosine(chunk.vector) })).sort((a, b) => b.score - a.score) };
  };
  const dataFor = (id) => {
    const { query, ranked } = results();
    const top = ranked.slice(0, state.count);
    const source = top.find(({ id }) => id === query.evidence);
    const prompt = `[SYSTEM PROMPT]\nJawab pertanyaan hanya berdasarkan konteks dokumen. Sertakan ID dokumen sebagai sitasi. Jika konteks tidak memuat jawabannya, katakan bahwa informasi tidak ditemukan.\n\n[KONTEKS DOKUMEN · TOP-${state.count}]\n${top.map(({ id, doc, title, page, text, score }) => `[${id} · ${title} · hlm. ${page} · skor ${fmt(score)}]\n${text}`).join("\n\n")}\n\n[PERTANYAAN]\n${query.question}`;
    const answer = source ? `${query.answer} [${source.id}, hlm. ${source.page}]` : !queries.some((item) => item.question === state.query) ? query.answer : "Dokumen yang ditemukan belum cukup untuk menjawab pertanyaan ini.";
    const values = {
      1: ["Upload / konektor dokumen", "Kumpulkan PDF kebijakan, spesifikasi, SOP, dan panduan", "DOC-01 · Kebijakan Cuti & Izin · HRD\nDOC-02 · Spesifikasi Server AI · Infrastruktur\nDOC-03 · SOP Penanganan Insiden · SRE / DevOps\nDOC-04 · Panduan Onboarding Dev · Engineering"],
      2: ["4 file PDF · sebagian dapat berupa scan", "Deteksi teks digital atau jalankan OCR; ambil nomor halaman dan metadata", chunks.map(({ doc, title, category, page, text }) => `${doc} · ${title} · ${category} · hlm. ${page}\n${text}`).join("\n\n")],
      3: ["Teks hasil ekstraksi + metadata dokumen", "Pisahkan per paragraf; simpan ID, halaman, dan kategori pada tiap chunk. Contoh ini memakai satu chunk representatif per dokumen.", chunks.map(({ id, doc, page, text }) => `${id} · ${doc} · hlm. ${page}\n${text}`).join("\n\n")],
      4: [chunks.map(({ id, text }) => `${id}\n${text}`).join("\n\n"), "Encode tiap chunk menjadi vektor angka", chunks.map(({ id, vector }) => `${id} → [${vector.map(fmt).join(", ")}]`).join("\n")],
      5: ["Chunk text, embedding, ID, kategori, halaman", "Simpan satu record per chunk pada vector database", JSON.stringify({ id: chunks[0].id, vector: chunks[0].vector, metadata: { document: chunks[0].doc, page: chunks[0].page, category: chunks[0].category } }, null, 2)],
      6: ["Input pengguna", "Terima dan teruskan query", query.question],
      7: [query.question, "Encode query dengan model embedding yang sama seperti indexing", `q_vec = [${query.vector.map(fmt).join(", ")}]`],
      8: [`Query vector: [${query.vector.map(fmt).join(", ")}]\nVector store: ${chunks.length} chunk`, `Urutkan cosine similarity lalu pilih Top-${state.count}`, ranked.map((item, index) => `${index + 1}. ${item.id} · ${item.title}\n   skor ${fmt(item.score)}${index < state.count ? " · dipilih" : ""}`).join("\n")],
      9: [`${top.length} chunk terpilih + query asli`, "Suntikkan konteks ke template instruksi sistem", prompt],
      10: ["Prompt augmented", "Hasilkan jawaban dan sertakan ID sumber", answer],
    };
    return { values: values[id], answer, query, ranked, top, source };
  };
  const statusFor = (id) => state.step === 0 ? "idle" : id < state.step ? "done" : id === state.step ? "active" : "idle";
  const statusLabel = (status) => status === "done" ? "Selesai" : status === "active" ? "Aktif" : "Menunggu";
  const edges = [[1, 2], [2, 3], [3, 4], [4, 5], [6, 7], [7, 8], [5, 8], [8, 9], [9, 10]];

  function render() {
    const inspector = ragNodes.find(({ id }) => id === state.selected);
    const { values } = dataFor(state.selected);
    const preset = root.querySelector("[data-query-preset]");
    preset.value = queries.some(({ question }) => question === state.query) ? state.query : "";
    const queryInput = root.querySelector("[data-rag-query]");
    if (queryInput.value !== state.query) queryInput.value = state.query;
    root.querySelector("[data-count]").value = String(state.count);
    root.querySelector("[data-auto]").textContent = state.timer ? "Jeda" : "Putar otomatis";
    root.querySelector("[data-rag-progress]").textContent = state.step === 0 ? "Siap" : state.step === nodeCount ? "Alur selesai" : `Node ${state.step} / ${nodeCount}`;

    const layer = root.querySelector("[data-node-layer]");
    const focusedNode = layer.contains(document.activeElement) ? document.activeElement.dataset.node : null;
    layer.innerHTML = ragNodes.map((node) => { const status = statusFor(node.id); const live = dataFor(node.id).values[2].split("\n")[0]; return `<button type="button" class="rag-node rag-node-${status}${node.lane === "online" ? " is-online" : ""}${state.selected === node.id ? " is-selected" : ""}" style="--node-x:${node.x}px;--node-y:${node.y}px" data-node="${node.id}" aria-pressed="${state.selected === node.id}"><span class="rag-node-kicker">${node.lane === "offline" ? "INDEX" : "QUERY"} · ${statusLabel(status)}</span><strong>${node.id}. ${node.title}</strong><small>${node.summary}</small><code>${escapeHtml(live)}</code></button>`; }).join("");
    if (focusedNode) layer.querySelector(`[data-node="${focusedNode}"]`)?.focus({ preventScroll: true });
    root.querySelectorAll("[data-edge-to]").forEach((edge) => edge.classList.toggle("is-active", state.step >= Number(edge.dataset.edgeTo)));

    root.querySelector("[data-inspector-phase]").textContent = inspector.lane === "offline" ? "INDEXING" : "QUERY";
    root.querySelector("[data-inspector-title]").textContent = inspector.title;
    root.querySelector("[data-inspector-description]").textContent = inspector.explanation;
    root.querySelector("[data-inspector-input]").textContent = values[0];
    root.querySelector("[data-inspector-process]").textContent = values[1];
    root.querySelector("[data-inspector-output]").textContent = values[2];
    root.querySelector("[data-inspector-counter]").textContent = `${state.selected} / ${nodeCount}`;
    root.querySelector("[data-prev-node]").disabled = state.selected === 1;
    root.querySelector("[data-next-node]").disabled = state.selected === nodeCount;
  }

  const edgeMarkup = edges.map(([from, to]) => { const a = ragNodes[from - 1], b = ragNodes[to - 1]; const crossLane = a.lane !== b.lane; const x1 = a.x + (crossLane ? 95 : 190), y1 = a.y + (crossLane ? 116 : 58), x2 = b.x + (crossLane ? 95 : 0), y2 = b.y + (crossLane ? 0 : 58); const bend = Math.min(100, Math.max(36, Math.abs(x2 - x1) * .35)); const path = crossLane ? `M ${x1} ${y1} C ${x1} ${y1 + 60}, ${x2} ${y2 - 60}, ${x2} ${y2}` : `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`; return `<path class="rag-edge" data-edge-to="${to}" d="${path}"/>`; }).join("");
  root.innerHTML = `<div class="rag-lab"><div class="rag-lab-heading"><div><strong>RAG workflow</strong><span data-rag-progress>Siap</span></div><p>Pilih node untuk melihat input, proses, dan output.</p></div><div class="rag-controls"><label>Pertanyaan <select data-query-preset><option value="">Query kustom</option>${queries.map(({ question }) => `<option value="${escapeHtml(question)}">${escapeHtml(question)}</option>`).join("")}</select></label><label>Hasil Top-K <select data-count><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label><label class="rag-query-label">Edit query <input data-rag-query value="${escapeHtml(state.query)}"></label><div class="rag-actions"><button type="button" data-step>Langkah berikutnya</button><button type="button" data-auto>Putar otomatis</button><button type="button" data-reset>Reset</button></div></div><div class="rag-workspace"><div class="rag-canvas-scroll"><div class="rag-canvas" role="group" aria-label="Alur node RAG"><div class="rag-lane rag-lane-offline"><span>Indexing · saat dokumen diperbarui</span></div><div class="rag-lane rag-lane-online"><span>Retrieval &amp; generation · setiap query</span></div><svg class="rag-edges" viewBox="0 0 1120 500" aria-hidden="true">${edgeMarkup}</svg><div class="rag-node-layer" data-node-layer></div></div></div><aside class="rag-inspector" aria-live="polite"><header><span>NODE <b data-inspector-phase></b></span><h2 data-inspector-title></h2></header><p data-inspector-description></p><section><small>1. DATA INPUT MASUK</small><pre data-inspector-input></pre></section><section class="rag-process"><small>2. TRANSFORMASI / PROSES</small><pre data-inspector-process></pre></section><section class="rag-output"><small>3. DATA OUTPUT KELUAR</small><pre data-inspector-output></pre></section><footer><button type="button" data-prev-node disabled>Sebelumnya</button><span data-inspector-counter></span><button type="button" data-next-node>Berikutnya</button></footer></aside></div></div>`;
  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (state.timer && !button.hasAttribute("data-auto")) { clearInterval(state.timer); state.timer = null; }
    if (button.dataset.node) state.selected = Number(button.dataset.node);
    if (button.hasAttribute("data-step")) { state.step = state.step >= nodeCount ? 1 : state.step + 1; state.selected = state.step; }
    if (button.hasAttribute("data-prev-node")) state.selected = Math.max(1, state.selected - 1);
    if (button.hasAttribute("data-next-node")) state.selected = Math.min(nodeCount, state.selected + 1);
    if (button.hasAttribute("data-reset")) { clearInterval(state.timer); state.timer = null; state.step = 0; state.selected = 1; state.count = 2; state.query = queries[0].question; }
    if (button.hasAttribute("data-auto")) {
      if (state.timer) { clearInterval(state.timer); state.timer = null; }
      else { state.timer = setInterval(() => { if (!root.isConnected) { clearInterval(state.timer); state.timer = null; return; } state.step = state.step >= nodeCount ? 1 : state.step + 1; state.selected = state.step; render(); if (state.step === nodeCount) { clearInterval(state.timer); state.timer = null; render(); } }, 1200); }
    }
    render();
  });
  root.addEventListener("input", (event) => {
    if (!event.target.matches("[data-rag-query]")) return;
    clearInterval(state.timer); state.timer = null; state.step = 0;
    state.query = event.target.value;
    render();
  });
  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-query-preset]")) state.query = event.target.value;
    if (event.target.matches("[data-count]")) state.count = Number(event.target.value);
    clearInterval(state.timer); state.timer = null; state.step = 0;
    render();
  });
  render();
  root.dataset.ready = "";
}

function mount(root) {
  if (root.dataset.aiTour === "rag") { mountRag(root); mountPractice(root, "rag"); return; }
  if (root.dataset.aiTour === "lora") { mountQlora(root); mountPractice(root, "lora"); return; }
  const tour = tours[root.dataset.aiTour];
  if (!tour) return;
  let state = tour.state();
  let stage = 0;
  let timer = null;
  const firstStage = 0;
  const lastStage = tour.stages.length - 1;
  const groups = tour.groups ?? [[0, tour.stages.length, ""]];
  root.innerHTML = `
    <div class="ai-tour-nav" aria-label="Tahap tur">
      ${groups.map(([start, end, label]) => `
        <div class="ai-tour-group">
          ${label ? `<strong>${label}</strong>` : ""}
          <div class="ai-tour-steps">
            ${tour.stages.slice(start, end).map((title, index) => `<button type="button" data-stage="${start + index}">${title}</button>`).join("")}
          </div>
        </div>`).join("")}
    </div>
    <div class="ai-tour-settings">${tour.settings}</div>
    <div class="ai-tour-controls">
      <button type="button" data-previous>Sebelumnya</button>
      <button type="button" data-next>Langkah berikutnya</button>
      <button type="button" data-play>Putar otomatis</button>
      <button type="button" data-reset>Mulai ulang</button>
    </div>
    <div class="ai-tour-panel">
      <h2 data-title aria-live="polite"></h2>
      <div data-content></div>
    </div>`;

  const find = (selector) => root.querySelector(selector);
  const play = find("[data-play]");
  const next = find("[data-next]");

  function render() {
    const heading = find("[data-title]");
    const title = tour.stages[stage];
    if (heading.textContent !== title) heading.textContent = title;
    const content = find("[data-content]");
    const focusTarget = content.contains(document.activeElement) ? document.activeElement : null;
    const evidence = focusTarget?.dataset.evidence;
    content.innerHTML = tour.render(state, stage);
    if (evidence !== undefined) find(`[data-evidence="${evidence}"]`)?.focus();
    root.querySelectorAll("[data-stage]").forEach((button) => {
      if (Number(button.dataset.stage) === stage) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    find("[data-previous]").disabled = stage === firstStage;
    next.disabled = stage === lastStage;
    if (root.dataset.aiTour === "lora") {
      const automatic = find('[data-setting="mode"]').value === "auto";
      play.hidden = !automatic;
      next.textContent = stage === lastStage ? "Selesai" : "Jalankan langkah";
    }
  }

  function pause() {
    clearInterval(timer);
    timer = null;
    play.textContent = "Putar otomatis";
  }

  function go(index) {
    const changed = stage !== index;
    stage = index;
    render();
    if (changed && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      find("[data-content]").animate([{ opacity: .45 }, { opacity: 1 }], { duration: 220 });
    }
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-play")) {
      if (timer !== null) {
        pause();
        return;
      }
      if (stage === lastStage) go(firstStage);
      play.textContent = "Jeda";
      timer = setInterval(() => {
        if (!root.isConnected) {
          pause();
          return;
        }
        go(stage + 1);
        if (stage === lastStage) pause();
      }, 2400);
      return;
    }
    pause();
    if (button.dataset.stage !== undefined) go(Number(button.dataset.stage));
    if (button.hasAttribute("data-next")) go(stage + 1);
    if (button.hasAttribute("data-previous")) go(stage - 1);
    if (button.hasAttribute("data-reset")) {
      state = tour.state();
      root.querySelectorAll("[data-setting]").forEach((input) => { input.value = state[input.dataset.setting]; });
      go(firstStage);
    }
    if (button.dataset.evidence !== undefined) {
      state.picked = button.dataset.evidence;
      render();
    }
  });

  root.addEventListener("input", ({ target }) => {
    const setting = target.dataset.setting;
    if (setting === undefined) return;
    pause();
    if (setting === "mode") {
      if (target.value === "auto") play.click();
      render();
      return;
    }
    state[setting] = Number(target.value);
    if (setting === "query" || setting === "count") state.picked = undefined;
    go(setting === "query" ? 4 : stage);
  });

  render();
  root.dataset.ready = "";
}

function initialize() {
  document.querySelectorAll("[data-ai-tour]:not([data-ready])").forEach(mount);
}

if (typeof document$ !== "undefined") document$.subscribe(initialize);
else initialize();
