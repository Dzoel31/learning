import { mountPractice } from "./lab-practice.mjs";
// Starting values and teaching scenarios adapted from the supplied NeuroLab HTML.
const inputs = [.8, -.5, 1, .4, -.7, .6];
const weights = [
  [.65, -.45, .8, .2, -.3, .5],
  [-.5, .75, .35, -.4, .6, -.25],
  [.4, .3, -.6, .55, .15, -.35],
  [-.7, -.2, .45, .35, -.5, .65],
];
const activations = {
  relu: { label: "ReLU", value: (z) => Math.max(0, z), derivative: (z) => Number(z > 0) },
  leaky_relu: {
    label: "Leaky ReLU (α = 0,01)",
    value: (z) => z > 0 ? z : .01 * z,
    derivative: (z) => z > 0 ? 1 : .01,
  },
  sigmoid: {
    label: "Sigmoid",
    value: (z) => 1 / (1 + Math.exp(-z)),
    derivative: (_, a) => a * (1 - a),
  },
  tanh: { label: "Tanh", value: Math.tanh, derivative: (_, a) => 1 - a * a },
  linear: { label: "Linear", value: (z) => z, derivative: () => 1 },
};
const presets = {
  balanced: { label: "Normal seimbang", hint: "Bandingkan neuron aktif dengan neuron yang menghasilkan nol." },
  saturated: { label: "Saturasi sigmoid", hint: "Neuron pertama masih salah, tetapi turunan sigmoid mendekati nol. Amati perubahan bobot setelah satu langkah." },
  dead: { label: "Dead ReLU", hint: "Neuron pertama punya z negatif. Pada contoh ini gradiennya nol, sehingga bobotnya tetap meski target belum tercapai." },
};
const format = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 4 });
const fmt = (value) => {
  if (value === 0) return "0";
  return Math.abs(value) < .0001 ? value.toExponential(2) : format.format(value);
};
const rowNames = ["N₁", "N₂", "N₃", "N₄"];

function startingState(preset) {
  const state = {
    preset, inputCount: 3, neuronCount: 2, selected: 0,
    activation: "relu", inputs: [...inputs], weights: weights.map((row) => [...row]),
    bias: [.1, -.15, .05, 0], target: [1, .2, .8, 0], rate: .1,
    epoch: 0, previousLoss: null, hint: presets[preset].hint,
  };
  if (preset === "saturated") {
    state.activation = "sigmoid";
    state.inputs.splice(0, 3, 2, 1.8, 2.2);
    state.weights[0].splice(0, 3, 2.4, 2.1, 2.5);
    state.weights[1].splice(0, 3, -2.2, -2, -2.3);
    state.bias.splice(0, 2, 1.5, -1.5);
    state.target.splice(0, 2, 0, 1);
    state.rate = .25;
  }
  if (preset === "dead") {
    state.inputs.splice(0, 3, 1, .8, 1.2);
    state.weights[0].splice(0, 3, -1.5, -1.2, -1.4);
    state.weights[1].splice(0, 3, .6, .4, .5);
    state.bias.splice(0, 2, -.5, .1);
    state.target.splice(0, 2, 1, 1);
    state.rate = .15;
  }
  return state;
}

function evaluate(state) {
  const activation = activations[state.activation];
  return state.weights.slice(0, state.neuronCount).map((row, neuron) => {
    const terms = row.slice(0, state.inputCount).map((weight, i) => weight * state.inputs[i]);
    const z = terms.reduce((sum, term) => sum + term, state.bias[neuron]);
    const a = activation.value(z);
    const derivative = activation.derivative(z, a);
    const error = a - state.target[neuron];
    return { z, a, derivative, loss: error ** 2, delta: (2 / state.neuronCount) * error * derivative };
  });
}

const mse = (results) => results.reduce((sum, { loss }) => sum + loss, 0) / results.length;

function networkSvg(state, results) {
  const y = (index, count) => 38 + ((index + .5) * 244) / count;
  const lines = results.map((_, neuron) => Array.from({ length: state.inputCount }, (_, i) => {
    const weight = state.weights[neuron][i];
    const kind = Math.abs(weight) < .01 ? "zero" : weight > 0 ? "positive" : "negative";
    const y0 = y(i, state.inputCount), y1 = y(neuron, state.neuronCount);
    const path = `M 84 ${y0} C 183 ${y0}, 236 ${y1}, 329 ${y1}`;
    const active = neuron === state.selected;
    return `<path class="neuron-edge" data-sign="${kind}" data-active="${active}" d="${path}" stroke-width="${1 + Math.min(Math.abs(weight), 3)}"/>
      ${active ? `<text x="135" y="${y0 * .93 + y1 * .07 - 7}" class="neuron-weight" data-sign="${kind}">${fmt(weight)}</text>` : ""}`;
  }).join("")).join("");
  return `<svg viewBox="0 0 494 310" class="neuron-network" role="group" aria-label="Diagram jaringan dan bobot">
    <text x="58" y="25" class="neuron-caption">Input</text>
    <text x="358" y="25" class="neuron-caption">Neuron</text>
    <text x="447" y="25" class="neuron-caption">Target</text>
    ${lines}
    ${state.inputs.slice(0, state.inputCount).map((value, i) => `<g aria-hidden="true">
      <circle cx="58" cy="${y(i, state.inputCount)}" r="21" class="neuron-input"/>
      <text x="58" y="${y(i, state.inputCount) - 2}" class="neuron-node-title">x${i + 1}</text>
      <text x="58" y="${y(i, state.inputCount) + 12}" class="neuron-node-value">${fmt(value)}</text>
    </g>`).join("")}
    ${results.map(({ z, a }, i) => {
      const cy = y(i, state.neuronCount);
      return `<g role="button" tabindex="0" data-neuron="${i}" aria-label="Neuron ${i + 1}, output ${fmt(a)}" aria-pressed="${i === state.selected}">
        <circle cx="358" cy="${cy}" r="30" class="neuron-node"/>
        <text x="358" y="${cy - 10}" class="neuron-node-title">${rowNames[i]}</text>
        <text x="358" y="${cy + 4}" class="neuron-node-value">z=${fmt(z)}</text>
        <text x="358" y="${cy + 18}" class="neuron-node-value">a=${fmt(a)}</text>
      </g><text x="447" y="${cy + 4}" class="neuron-node-value">${fmt(state.target[i])}</text>`;
    }).join("")}</svg>`;
}

function activationSvg(key, { z, a }) {
  const activation = activations[key];
  const extent = Math.max(4, Math.ceil(Math.abs(z)));
  const low = Math.min(-.25, activation.value(-extent));
  const high = Math.max(1.25, activation.value(extent));
  const x = (value) => 28 + (value + extent) * 264 / (2 * extent);
  const y = (value) => 143 - (value - low) * 122 / (high - low);
  const path = (getValue) => Array.from({ length: 81 }, (_, index) => {
    const input = extent * (index / 40 - 1);
    return `${x(input).toFixed(2)},${y(getValue(input)).toFixed(2)}`;
  }).join(" ");
  return `<svg viewBox="0 0 320 166" class="neuron-chart" role="img" aria-label="Kurva ${activation.label}. Titik kerja z ${fmt(z)} dan output ${fmt(a)}">
    <path class="neuron-axis" d="M 28 ${y(0)} H 292 M ${x(0)} 16 V 145"/>
    <polyline class="neuron-curve" points="${path(activation.value)}"/>
    <polyline class="neuron-derivative" points="${path((input) => activation.derivative(input, activation.value(input)))}"/>
    <path class="neuron-guide" d="M ${x(z)} ${y(0)} V ${y(a)} H ${x(0)}"/>
    <circle cx="${x(z)}" cy="${y(a)}" r="5" class="neuron-point"/>
    <text x="28" y="158" class="neuron-node-value">${fmt(-extent)}</text>
    <text x="292" y="158" class="neuron-node-value">${fmt(extent)}</text>
    <text x="304" y="${y(0) + 4}" class="neuron-node-value">z</text>
  </svg>`;
}

function mount(root) {
  root.innerHTML = `
    <div class="neuron-presets" role="group" aria-label="Skenario">
      ${Object.entries(presets).map(([id, preset]) => `<button type="button" data-preset="${id}">${preset.label}</button>`).join("")}
    </div>
    <p class="neuron-hint" data-hint></p>
    <div class="neuron-grid">
      <div class="neuron-stack">
        <section>
          <h2>Arsitektur & aktivasi</h2>
          <label>Jumlah input <input type="number" data-state="inputCount" min="1" max="6" step="1"></label>
          <label>Jumlah neuron <input type="number" data-state="neuronCount" min="1" max="4" step="1"></label>
          <label>Aktivasi <select data-state="activation" aria-label="Aktivasi">${Object.entries(activations).map(([key, {label}]) => `<option value="${key}">${label}</option>`).join("")}</select></label>
          <div data-inputs></div>
        </section>
        <section>
          <h2>Inisialisasi bobot</h2>
          <label>Distribusi <select data-distribution><option value="normal">Normal</option><option value="uniform">Uniform</option><option value="xavier">Xavier normal</option><option value="he">He normal</option></select></label>
          <label>Mean (μ) <input data-mean type="number" min="-10" max="10" step="any" value="0"></label>
          <label><span data-spread-label>Standar deviasi (σ)</span> <input data-spread type="number" min="0" max="10" step="any" value="0.5"></label>
          <button type="button" data-random>Acak bobot</button>
        </section>
      </div>
      <div class="neuron-stack">
        <section>
          <h2>Visualisasi jaringan & sinapsis</h2>
          <div class="neuron-key"><span data-sign="positive">Bobot positif</span><span data-sign="negative">Bobot negatif</span><span data-sign="zero">Mendekati nol</span></div>
          <div data-network></div>
        </section>
        <section>
          <h2 data-parameters-title></h2>
          <div data-parameters></div>
        </section>
      </div>
      <div class="neuron-stack">
        <section>
          <h2>Kurva aktivasi & titik kerja</h2>
          <div class="neuron-key"><span data-sign="positive">Aktivasi f(z)</span><span data-sign="derivative">Turunan f′(z)</span></div>
          <div data-chart></div>
          <pre><code data-math></code></pre>
        </section>
        <section>
          <h2>Gradient descent</h2>
          <label>Learning rate <input data-state="rate" type="number" min="0" max="2" step="0.01"></label>
          <div class="neuron-presets">
            <button type="button" data-step>Langkah gradient descent</button>
            <button type="button" data-auto>Latih otomatis</button>
          </div>
          <p data-progress role="status"></p>
        </section>
      </div>
    </div>`;

  const find = (selector) => root.querySelector(selector);
  const auto = find("[data-auto]");
  const step = find("[data-step]");
  const distribution = find("[data-distribution]");
  const mean = find("[data-mean]");
  const spreadInput = find("[data-spread]");
  let state = startingState("balanced");
  let timer;
  let stopped = false;
  let results;
  let message = "";
  const numericField = (label, field, value, index = "") =>
    `<label>${label}<input type="number" step="any" min="-20" max="20" data-edit="${field}" data-index="${index}" value="${Number(value.toPrecision(10))}"></label>`;

  function render(rebuildFields = true) {
    results = evaluate(state);
    const { selected, activation, epoch, previousLoss, inputCount } = state;
    const result = results[selected];
    find("[data-hint]").textContent = state.hint;
    root.querySelectorAll("[data-preset]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.preset === state.preset)));
    root.querySelectorAll("[data-state]").forEach((field) => { field.value = state[field.dataset.state]; });
    find("[data-network]").innerHTML = networkSvg(state, results);
    find("[data-parameters-title]").textContent = `Parameter ${rowNames[selected]}`;
    if (rebuildFields) {
      find("[data-inputs]").innerHTML = state.inputs.slice(0, inputCount)
        .map((value, i) => numericField(`Input x${i + 1}`, "inputs", value, i)).join("");
      find("[data-parameters]").innerHTML = state.weights[selected].slice(0, inputCount)
        .map((value, i) => numericField(`Bobot w${i + 1}`, "weights", value, i)).join("")
        + numericField("Bias", "bias", state.bias[selected]) + numericField("Target", "target", state.target[selected]);
    }
    find("[data-chart]").innerHTML = activationSvg(activation, result);
    const terms = state.weights[selected].slice(0, inputCount)
      .map((value, i) => `(${fmt(value)} × ${fmt(state.inputs[i])})`);
    find("[data-math]").textContent = [
      `z = ${terms.join(" + ")} + (${fmt(state.bias[selected])}) = ${fmt(result.z)}`,
      `a = ${activations[activation].label}(z) = ${fmt(result.a)}`,
      `f′(z) = ${fmt(result.derivative)}`,
      `∂MSE/∂b = ${fmt(result.delta)}`,
    ].join("\n");
    const loss = mse(results);
    find("[data-progress]").textContent = message || (previousLoss === null
      ? `Langkah ${epoch} · MSE ${fmt(loss)}`
      : `Langkah ${epoch} · MSE ${fmt(previousLoss)} → ${fmt(loss)}`);
    step.disabled = stopped;
    auto.disabled = stopped;
  }

  function pause() {
    clearInterval(timer);
    timer = undefined;
    auto.textContent = "Latih otomatis";
  }

  function resetProgress() {
    state.epoch = 0;
    state.previousLoss = null;
    message = "";
    stopped = false;
  }

  function train() {
    const current = mse(results);
    const nextBias = [...state.bias];
    const nextWeights = state.weights.map((row) => [...row]);
    results.forEach(({delta}, neuron) => {
      nextBias[neuron] -= state.rate * delta;
      for (let i = 0; i < state.inputCount; i++) nextWeights[neuron][i] -= state.rate * delta * state.inputs[i];
    });
    if ([...nextBias, ...nextWeights.flat()].some((value) => !Number.isFinite(value) || Math.abs(value) > 1000)) {
      pause();
      message = "Pelatihan dihentikan karena pembaruan terlalu besar. Kecilkan learning rate atau pilih ulang skenario.";
      stopped = true;
    } else {
      state.bias = nextBias;
      state.weights = nextWeights;
      state.epoch += 1;
      state.previousLoss = current;
    }
    render();
  }

  function selectNeuron(node) {
    const neuron = Number(node.dataset.neuron);
    state.selected = neuron;
    render();
    find(`[data-neuron="${neuron}"]`).focus();
  }

  root.addEventListener("click", (event) => {
    const node = event.target.closest("[data-neuron]");
    const button = event.target.closest("button");
    if (node) {
      pause();
      selectNeuron(node);
    }
    if (!button) return;
    if (button.hasAttribute("data-auto")) {
      if (timer !== undefined) pause();
      else {
        auto.textContent = "Jeda";
        timer = setInterval(() => root.isConnected ? train() : pause(), 350);
      }
      return;
    }
    pause();
    if (button.dataset.preset) {
      state = startingState(button.dataset.preset);
      resetProgress();
      render();
    }
    if (button.hasAttribute("data-step")) train();
    if (button.hasAttribute("data-random")) {
      const method = distribution.value;
      if (!spreadInput.checkValidity() || !Number.isFinite(spreadInput.valueAsNumber)) return;
      if (!mean.disabled && (!mean.checkValidity() || !Number.isFinite(mean.valueAsNumber))) return;
      const scale = spreadInput.valueAsNumber;
      const spread = {
        normal: scale,
        xavier: scale * Math.sqrt(2 / (state.inputCount + state.neuronCount)),
        he: scale * Math.sqrt(2 / state.inputCount),
      }[method];
      for (let j = 0; j < state.neuronCount; j++) {
        for (let i = 0; i < state.inputCount; i++) {
          const random = method === "uniform" ? (2 * Math.random() - 1) * scale
            : Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random()) * spread
              + (mean.disabled ? 0 : mean.valueAsNumber);
          state.weights[j][i] = random;
        }
      }
      resetProgress();
      render();
    }
  });

  root.addEventListener("keydown", (event) => {
    const node = event.target.closest("[data-neuron]");
    if (node && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      pause();
      selectNeuron(node);
    }
  });

  root.addEventListener("change", ({ target }) => {
    const { state: field, edit, index } = target.dataset;
    if (!field && !edit) return;
    pause();
    const value = target.valueAsNumber;
    if (field === "activation") state.activation = target.value;
    else if (target.validity.valid && Number.isFinite(value)) {
      if (field) state[field] = value;
      else if (edit === "weights") state.weights[state.selected][index] = value;
      else if (edit === "inputs") state.inputs[index] = value;
      else state[edit][state.selected] = value;
    }
    state.selected = Math.min(state.selected, state.neuronCount - 1);
    if (field === "rate") {
      stopped = false;
      message = "";
    } else {
      state.preset = null;
      state.hint = "";
      resetProgress();
    }
    if (edit) {
      const original = edit === "weights" ? state.weights[state.selected][index]
        : edit === "inputs" ? state.inputs[index] : state[edit][state.selected];
      target.value = Number(original.toPrecision(10));
    }
    render(Boolean(field && field.endsWith("Count")));
  });

  root.addEventListener("focusin", ({ target }) => {
    if (target.matches("input, select")) pause();
  });

  distribution.addEventListener("change", () => {
    const method = distribution.value;
    mean.disabled = method !== "normal";
    spreadInput.value = method === "normal" ? .5 : 1;
    find("[data-spread-label]").textContent = method === "normal" ? "Standar deviasi (σ)"
      : method === "uniform" ? "Setengah lebar interval" : "Gain";
  });

  render();
  root.dataset.ready = "";
  mountPractice(root, "neuron");
}

function initialize() {
  document.querySelectorAll("[data-neuron-lab]:not([data-ready])").forEach(mount);
}

if (typeof document$ !== "undefined") document$.subscribe(initialize);
else initialize();
