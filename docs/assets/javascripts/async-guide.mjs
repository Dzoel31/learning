import { mountPractice } from "./lab-practice.mjs";
const modes = {
  sync: {
    title: "Memblokir",
    explanation: "Satu jalur menunggu hasil A sebelum mulai mengerjakan B.",
    code: 'function handlerA() {\n  // Busy wait hanya untuk demonstrasi blocking.\n  const end = Date.now() + 3 * 1000;\n  while (Date.now() < end) {}\n  return { status: "ok" };\n}',
  },
  async: {
    title: "Asinkron dengan await",
    explanation: "Saat A menunggu I/O, event loop bisa menjalankan B.",
    code: 'const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));\n\nasync function handlerA() {\n  await sleep(3 * 1000); // Menirukan I/O nonblocking\n  return { status: "ok" };\n}',
  },
  blocked: {
    title: "Async yang memblokir",
    explanation: "Operasi sinkron di dalam fungsi async tetap menahan event loop.",
    code: 'async function handlerA() {\n  const end = Date.now() + 3 * 1000;\n  while (Date.now() < end) {} // Tetap memblokir\n  return { status: "ok" };\n}',
  },
};

function mount(guide) {
  guide.innerHTML = `
    <fieldset class="async-guide-modes">
      <legend>Cara backend menunggu I/O</legend>
      ${Object.entries(modes).map(([mode, { title }]) => `
        <label><input type="radio" name="async-guide-mode" value="${mode}" ${mode === "sync" ? "checked" : ""}>
          <span>${title}</span>
        </label>`).join("")}
    </fieldset>
    <label class="async-guide-delay">
      Durasi I/O A <output data-duration>3 detik</output>
      <input data-delay type="range" min="1" max="5" step="1" value="3">
    </label>
    <div class="async-guide-panel">
      <p data-explanation></p>
      <div class="async-guide-timeline" role="group" aria-label="Garis waktu dua request" data-timeline></div>
      <div class="async-guide-actions">
        <button type="button" data-step>Detik berikutnya</button>
        <button type="button" data-play>Putar otomatis</button>
        <button type="button" data-reset>Ulangi</button>
        <span data-clock></span>
      </div>
      <p data-status role="status" aria-atomic="true"></p>
      <details class="async-guide-code">
        <summary>Lihat potongan handler untuk A</summary>
        <pre><code data-example></code></pre>
      </details>
    </div>`;

  const find = (selector) => guide.querySelector(selector);
  const delay = find("[data-delay]");
  const step = find("[data-step]");
  const play = find("[data-play]");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let second = 0;
  let position = 0;
  let frame = null;
  let startTime;

  const modeInput = () => find('input[name="async-guide-mode"]:checked');
  const endTime = () => modeInput().value === "async"
    ? Math.max(2, delay.valueAsNumber)
    : delay.valueAsNumber + 1;

  function moveMarker() {
    const shown = motion.matches ? second : position;
    guide.style.setProperty("--guide-position", `${(shown / (delay.valueAsNumber + 1)) * 100}%`);
  }

  function pause() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    startTime = undefined;
    play.textContent = "Putar otomatis";
  }

  function draw() {
    const mode = modeInput().value;
    const duration = delay.valueAsNumber;
    const span = duration + 1;
    const startB = mode === "async" ? 1 : duration;
    const states = [
      { title: "Request A", arrives: 0, starts: 0, ends: duration },
      { title: "Request B", arrives: 1, starts: startB, ends: startB + 1 },
    ];
    const finish = endTime();
    const elapsed = Math.min(second, finish);
    const percent = (time) => (time / span) * 100;
    const status = ({ arrives, starts, ends }) => {
      if (elapsed < arrives) return "Belum masuk";
      if (elapsed < starts) return "Antre";
      if (elapsed < ends) return "Menunggu I/O";
      return "Respons selesai";
    };
    const segment = (type, from, to) => to > from
      ? `<span class="async-guide-segment" data-kind="${type}" style="--start:${percent(from)}%;--length:${percent(to - from)}%"></span>`
      : "";

    find("[data-duration]").textContent = duration + " detik";
    find("[data-explanation]").textContent = modes[mode].explanation;
    find("[data-timeline]").innerHTML = `
      <div class="async-guide-scale" aria-hidden="true">
        ${Array.from({ length: span + 1 }, (_, time) => `<span>${time}</span>`).join("")}
      </div>
      ${states.map((request) => `
        <div class="async-guide-row">
          <div><strong>${request.title}</strong> <span>${status(request)}</span></div>
          <div class="async-guide-track" aria-hidden="true">
            ${segment("queue", request.arrives, request.starts)}
            ${segment("io", request.starts, request.ends)}
            <span class="async-guide-marker"></span>
          </div>
          <small>Masuk ${request.arrives}s · Mulai ${request.starts}s · Selesai ${request.ends}s</small>
        </div>`).join("")}
      <div class="async-guide-key" aria-hidden="true">
        <span data-kind="queue">Antre</span><span data-kind="io">Menunggu I/O</span>
      </div>`;
    find("[data-clock]").textContent = `Detik ${elapsed} dari ${finish}`;
    find("[data-status]").textContent = elapsed === finish
      ? `Kedua respons selesai dalam ${finish} detik.`
      : `Detik ${elapsed}. ${states.map((request) => request.title + " " + status(request).toLowerCase()).join(". ")}.`;
    find("[data-example]").textContent = modes[mode].code.replace("3 * 1000", `${duration} * 1000`);
    step.disabled = elapsed === finish;
    play.disabled = elapsed === finish;
    moveMarker();
  }

  function advance(timestamp) {
    startTime ??= timestamp - position * 1000;
    const finish = endTime();
    position = Math.min(finish, (timestamp - startTime) / 1000);
    const nextSecond = Math.floor(position);
    if (second !== nextSecond) {
      second = nextSecond;
      draw();
    } else {
      moveMarker();
    }
    if (position < finish && guide.isConnected) frame = requestAnimationFrame(advance);
    else pause();
  }

  function restart() {
    pause();
    second = 0;
    position = 0;
    draw();
  }

  delay.addEventListener("input", restart);
  guide.querySelectorAll('input[name="async-guide-mode"]').forEach((input) => {
    input.addEventListener("change", restart);
  });
  step.addEventListener("click", () => {
    pause();
    second += 1;
    position = second;
    draw();
  });
  play.addEventListener("click", () => {
    if (frame !== null) {
      pause();
      return;
    }
    play.textContent = "Jeda";
    frame = requestAnimationFrame(advance);
  });
  find("[data-reset]").addEventListener("click", restart);
  draw();
  guide.dataset.ready = "";
  mountPractice(guide, "async");
}

function initialize() {
  document.querySelectorAll("[data-async-guide]:not([data-ready])").forEach(mount);
}

if (typeof document$ !== "undefined") document$.subscribe(initialize);
else initialize();
