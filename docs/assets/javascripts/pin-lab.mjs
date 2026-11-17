import { mountPractice } from "./lab-practice.mjs";
const ids = (line) => line.split(" ");
const pinMap = (rows) => Object.fromEntries(rows.map(([id, roles, note]) => [String(id), {
  roles: roles ? ids(roles) : [],
  note,
}]));

const esp32 = pinMap([
  [0, "ADC2 Touch Boot", "Tahan rendah saat reset untuk masuk mode download."],
  [1, "UART", "TX UART0. Jalur ini mengirim log boot dan terhubung ke USB–serial."],
  [2, "ADC2 Touch Boot", "Sebagian DevKit V1 menghubungkan LED bawaan ke GPIO2. Untuk masuk mode download, GPIO2 harus rendah atau dibiarkan mengambang. Periksa skema board bila upload gagal."],
  [3, "UART", "RX UART0. Jalur ini terhubung ke USB–serial untuk upload."],
  [4, "ADC2 Touch"], [5, "SPI Boot", "Pin strapping. Periksa level saat reset jika dipakai sebagai CS."],
  [6, "Flash"], [7, "Flash"], [8, "Flash"], [9, "Flash"], [10, "Flash"], [11, "Flash"],
  [12, "ADC2 Touch Boot", "Level tinggi saat reset dapat memilih tegangan flash 1,8 V."],
  [13, "ADC2 Touch"], [14, "ADC2 Touch"],
  [15, "ADC2 Touch Boot", "Level pin saat reset memengaruhi log boot."],
  [16, "UART", "RX2 pada konfigurasi lab. Pada WROVER, GPIO16 dipakai oleh PSRAM."],
  [17, "UART", "TX2 pada konfigurasi lab. Pada WROVER, GPIO17 dipakai oleh PSRAM."],
  [18, "SPI", "SCK pada pemetaan SPI lab."], [19, "SPI", "MISO pada pemetaan SPI lab."],
  [21, "I²C", "SDA bawaan untuk profil Generic ESP32 di Arduino."],
  [22, "I²C", "SCL bawaan untuk profil Generic ESP32 di Arduino."],
  [23, "SPI", "MOSI pada pemetaan SPI lab."],
  [25, "ADC2 DAC", "Keluaran DAC kanal 1."], [26, "ADC2 DAC", "Keluaran DAC kanal 2."],
  [27, "ADC2 Touch"], [32, "ADC1 Touch"], [33, "ADC1 Touch"],
  [34, "ADC1 Input"], [35, "ADC1 Input"],
  [36, "ADC1 Input", "Juga diberi label VP atau SENSOR_VP."],
  [39, "ADC1 Input", "Juga diberi label VN atau SENSOR_VN."],
]);

const esp8266 = pinMap([
  ["A0", "ADC Input", "Satu kanal analog. TOUT pada chip menerima 0–1,0 V. Periksa pembagi tegangan pada skema A0 board."],
  ["D0", "", "GPIO16. Memiliki batasan dibanding GPIO lain, termasuk tanpa interrupt GPIO biasa."],
  ["D1", "I²C", "GPIO5. SCL pada pemetaan I²C lab."],
  ["D2", "I²C", "GPIO4. SDA pada pemetaan I²C lab."],
  ["D3", "Boot", "GPIO0. Tahan rendah saat reset untuk masuk mode download."],
  ["D4", "Boot", "GPIO2. Harus tinggi saat boot normal."],
  ["D5", "SPI", "GPIO14. SCK."], ["D6", "SPI", "GPIO12. MISO."], ["D7", "SPI", "GPIO13. MOSI."],
  ["D8", "SPI Boot", "GPIO15. Harus rendah saat reset."],
  ["RX", "UART", "GPIO3, RX UART0. Terhubung ke USB–serial."],
  ["TX", "UART", "GPIO1, TX UART0. Terhubung ke USB–serial."],
  ...ids("CLK SD0 SD1 SD2 SD3 CMD").map((id) => [id, "Flash"]),
]);

const uno = pinMap([
  ["D0", "UART", "RX. Terhubung ke USB–serial."], ["D1", "UART", "TX. Terhubung ke USB–serial."],
  ["D2", ""], ["D3", "PWM"], ["D4", ""], ["D5", "PWM"], ["D6", "PWM"],
  ["D7", ""], ["D8", ""], ["D9", "PWM"], ["D10", "PWM SPI", "SS umum untuk SPI."],
  ["D11", "PWM SPI", "MOSI (COPI)."], ["D12", "SPI", "MISO (CIPO)."],
  ["D13", "SPI", "SCK dan LED bawaan."],
  ["A0", "ADC"], ["A1", "ADC"], ["A2", "ADC"], ["A3", "ADC"],
  ["A4", "ADC I²C", "Berbagi jalur fisik dengan SDA di header digital."],
  ["A5", "ADC I²C", "Berbagi jalur fisik dengan SCL di header digital."],
  ["AREF", "Daya", "Referensi tegangan eksternal untuk ADC."],
  ["IOREF", "Daya", "Menunjukkan level tegangan I/O board, 5 V pada Uno R3."],
  ["NC", "", "Pin cadangan tanpa sambungan."],
]);

const boards = {
  devkit: {
    label: "ESP32", name: "DevKit V1", spec: "30 pin · 3,3 V · Wi-Fi + Bluetooth",
    left: "EN 36 39 34 35 32 33 25 26 27 14 12 13 GND VIN",
    right: "23 22 1 3 21 19 18 5 17 16 4 2 15 GND 3V3",
    pins: esp32, family: "esp32", first: "34",
  },
  devkitc: {
    label: "ESP32", name: "DevKitC V4 WROOM", spec: "38 pin · 3,3 V · Wi-Fi + Bluetooth",
    left: "3V3 EN 36 39 34 35 32 33 25 26 27 14 12 GND 13 9 10 11 5V",
    right: "GND 23 22 1 3 21 GND 19 18 5 17 16 4 0 2 15 8 7 6",
    pins: esp32, family: "esp32", first: "34",
  },
  nodemcu: {
    label: "ESP8266", name: "NodeMCU 1.0", spec: "30 pin · 3,3 V · Wi-Fi",
    left: "A0 RSV RSV SD3 SD2 SD1 CMD SD0 CLK GND 3V3 EN RST GND VIN",
    right: "D0 D1 D2 D3 D4 3V3 GND D5 D6 D7 D8 RX TX GND 3V3",
    pins: esp8266, family: "esp8266", first: "A0",
  },
  uno: {
    label: "Arduino Uno", name: "Uno R3", spec: "ATmega328P · 5 V · 16 MHz",
    left: "SCL SDA AREF GND D13 D12 D11 D10 D9 D8 D7 D6 D5 D4 D3 D2 D1 D0",
    right: "NC IOREF RST 3V3 5V GND GND VIN A0 A1 A2 A3 A4 A5",
    pins: uno, family: "uno", first: "A0",
  },
};

const common = pinMap([
  ["3V3", "Daya", "Rel daya 3,3 V. Cek batas arus regulator pada board."],
  ["5V", "Daya", "Rel 5 V. Ikuti panduan board saat memilih sumber daya."],
  ["VIN", "Daya", "Masukan daya ke regulator. Rentang tegangan mengikuti spesifikasi board."],
  ["GND", "Daya", "Referensi 0 V untuk board dan periferal yang terhubung."],
  ["EN", "Reset", "Enable aktif tinggi. Menariknya ke rendah menonaktifkan chip."],
  ["RST", "Reset", "Reset aktif rendah."],
  ["RSV", "", "Pin cadangan pada NodeMCU 1.0."],
]);

const canonical = (id) => ({ SDA: "A4", SCL: "A5" })[id] ?? id;
const pin = (board, id) => board.pins[canonical(id)] ?? common[id];
const pinLabel = (board, id) => board.family === "esp32" && /^\d+$/.test(id) ? "GPIO" + id : id;
const allPins = (board) => [...new Set(ids(board.left + " " + board.right).map(canonical))];

function pinRoles(board, id) {
  const roles = [...pin(board, id).roles];
  if (board.pins[canonical(id)] && !roles.some((role) => ["Flash", "Daya"].includes(role)) &&
      id !== "NC" && !(board.family === "esp8266" && id === "A0")) {
    roles.push("Digital");
    if (board.family !== "uno" && !roles.includes("Input")) roles.push("PWM");
  }
  return roles;
}

const roleNotes = {
  ADC: "ADC mengubah tegangan masukan menjadi nilai digital. Pada board ini resolusinya 10 bit.",
  ADC1: "ADC1 tetap tersedia saat Wi-Fi aktif.",
  ADC2: "Pada ESP32 klasik, pembacaan ADC2 berbenturan dengan Wi-Fi aktif.",
  Input: "Pin ini hanya bisa menerima masukan.",
  Flash: "Terhubung ke bus flash. Hindari menggunakan pin ini sebagai I/O proyek.",
};

// Channels shown in the source explorer, checked against the ESP32 Series Datasheet.
const esp32Channels = {
  0: ["ADC2_CH1", 1, 11], 2: ["ADC2_CH2", 2, 12], 4: ["ADC2_CH0", 0, 10],
  12: ["ADC2_CH5", 5, 15], 13: ["ADC2_CH4", 4, 14], 14: ["ADC2_CH6", 6, 16],
  15: ["ADC2_CH3", 3, 13], 25: ["ADC2_CH8", null, 6, 1], 26: ["ADC2_CH9", null, 7, 2],
  27: ["ADC2_CH7", 7, 17], 32: ["ADC1_CH4", 9, 9], 33: ["ADC1_CH5", 8, 8],
  34: ["ADC1_CH6", null, 4], 35: ["ADC1_CH7", null, 5],
  36: ["ADC1_CH0", null, 0], 39: ["ADC1_CH3", null, 3],
};

const headerAliases = {
  0: "BOOT", 1: "TX0", 3: "RX0", 6: "CLK", 7: "SD0", 8: "SD1", 9: "SD2", 10: "SD3",
  11: "CMD", 16: "RX2", 17: "TX2", 21: "SDA", 22: "SCL", 36: "VP", 39: "VN",
};

const esp8266Gpio = { D0: 16, D1: 5, D2: 4, D3: 0, D4: 2, D5: 14, D6: 12, D7: 13, D8: 15, RX: 3, TX: 1 };

function pinFacts(board, id, roles) {
  const facts = [];
  if (board.family === "esp32") {
    const [adc, touch, rtc, dac] = esp32Channels[id] ?? [];
    if (adc) facts.push(["Saluran ADC", adc]);
    if (touch != null) facts.push(["Sensor sentuh", "TOUCH_CH" + touch]);
    if (rtc != null) facts.push(["RTC GPIO", "RTC_GPIO" + rtc]);
    if (dac) facts.push(["Keluaran DAC", "DAC_" + dac + " · 8 bit"]);
    if (roles.includes("Digital")) {
      const strapPull = { 0: "Pull-up", 2: "Pull-down", 5: "Pull-up", 12: "Pull-down", 15: "Pull-up" }[id];
      facts.push(["Resistor internal", roles.includes("Input") ? "Tidak tersedia"
        : strapPull ? strapPull + " saat reset" : "Pull-up / pull-down"]);
    }
  }
  if (board.family === "esp8266" && Object.hasOwn(esp8266Gpio, id)) {
    facts.push(["Nomor GPIO", esp8266Gpio[id]], ["Resistor internal", id === "D0" ? "Pull-down" : "Pull-up"]);
  }
  if (board.family === "uno" && roles.includes("Digital")) facts.push(["Resistor internal", "Pull-up"]);
  if (roles.includes("ADC")) facts.push(["Saluran ADC", board.family === "uno" ? "ADC" + canonical(id).slice(1) : "TOUT"]);
  return facts;
}

function exampleFor(board, id, roles, language) {
  if (roles.some((role) => ["Flash", "Daya", "Reset"].includes(role))) return "";
  const analog = roles.some((role) => ["ADC", "ADC1", "ADC2"].includes(role));
  if (!analog && !roles.includes("Digital")) return "";
  const number = board.family === "esp8266" ? esp8266Gpio[id] : canonical(id);
  if (language === "python") {
    const setup = analog
      ? board.family === "esp8266" ? "from machine import ADC\nsensor = ADC(0)" : `from machine import ADC, Pin\nsensor = ADC(Pin(${number}))`
      : `from machine import Pin\nsensor = Pin(${number}, Pin.IN)`;
    const read = analog ? board.family === "esp8266" ? "read()" : "read_u16()" : "value()";
    return `${setup}\nfrom time import sleep\n\nwhile True:\n    print(sensor.${read})\n    sleep(0.5)`;
  }
  const arduinoPin = board.family === "uno" && id.startsWith("D") ? id.slice(1)
    : board.family === "esp8266" && analog ? "A0" : number;
  return `const int PIN = ${arduinoPin};\n\nvoid setup() {\n  Serial.begin(115200);${analog ? "" : "\n  pinMode(PIN, INPUT);"}\n}\n\nvoid loop() {\n  Serial.println(${analog ? "analogRead" : "digitalRead"}(PIN));\n  delay(500);\n}`;
}

const signalGroups = {
  analog: { label: "Sensor analog", signals: ["ADC"], defaults: { esp32: ["34"], esp8266: ["A0"], uno: ["A0"] } },
  analog2: { label: "Sensor analog kedua", signals: ["ADC"], defaults: { esp32: ["35"], esp8266: [""], uno: ["A1"] } },
  i2c: { label: "OLED / sensor I²C", signals: ["SDA", "SCL"], defaults: { esp32: ["21", "22"], esp8266: ["D2", "D1"], uno: ["A4", "A5"] } },
  spi: { label: "Kartu SD / layar SPI", signals: ["SCK", "MISO", "MOSI", "CS"], defaults: { esp32: ["18", "19", "23", "5"], esp8266: ["D5", "D6", "D7", "D8"], uno: ["D13", "D12", "D11", "D10"] } },
  serial: { label: "GPS / perangkat UART", signals: ["RX", "TX"], defaults: { esp32: ["16", "17"], esp8266: ["RX", "TX"], uno: ["D0", "D1"] } },
  relay: { label: "Relay / aktuator", signals: ["Output"], defaults: { esp32: ["27"], esp8266: ["D1"], uno: ["D7"] } },
  pwm: { label: "Servo / LED PWM", signals: ["PWM"], defaults: { esp32: ["25"], esp8266: ["D2"], uno: ["D9"] } },
  touch: { label: "Tombol sentuh", signals: ["Touch"], defaults: { esp32: ["32"] } },
};

const filters = ["ADC", "ADC1", "ADC2", "DAC", "Touch", "Digital", "PWM", "I²C", "SPI", "UART", "Input", "Boot", "Flash", "Daya"];
const presets = {
  monitor: { label: "Monitor tanaman", groups: ["analog", "i2c"], wifi: true },
  conflict: { label: "Coba konflik", groups: ["analog", "i2c"], wifi: true },
};
const conflictPin = { esp32: "25", esp8266: "D2", uno: "A4" };

function analyze(board, assignments, wifi) {
  const issues = [];
  const occupied = new Map();

  for (const { group, signal, id, index } of assignments) {
    const label = signalGroups[group].label + " · " + signal;
    if (!id) {
      issues.push(["error", label + " perlu pin."]);
      continue;
    }
    const name = pinLabel(board, id);
    const roles = pinRoles(board, id);
    if (occupied.has(id)) issues.push(["error", name + " dipakai oleh " + occupied.get(id) + " dan " + label + "."]);
    occupied.set(id, label);

    const expected = signalGroups[group].defaults[board.family][index];
    const fixed = board.family !== "esp32" && (
      group === "serial" || (group === "i2c" && board.family === "uno") ||
      (group === "spi" && signal !== "CS")
    );
    const digital = roles.includes("Digital");
    const compatible = {
      ADC: roles.some((role) => ["ADC", "ADC1", "ADC2"].includes(role)),
      Touch: roles.includes("Touch"),
      PWM: roles.includes("PWM"),
      RX: digital,
      MISO: digital,
    }[signal] ?? (digital && !roles.includes("Input"));

    if (!compatible || (fixed && id !== expected)) {
      issues.push(["error", name + " tidak mendukung " + signal + " untuk konfigurasi ini."]);
    }
    if (wifi && signal === "ADC" && roles.includes("ADC2")) {
      issues.push(["error", name + " memakai ADC2. Pilih pin ADC1 saat Wi-Fi aktif."]);
    }
    if (roles.includes("Boot")) issues.push(["warning", name + " adalah pin strapping. " + pin(board, id).note]);
    if (board.family === "esp32" ? ["1", "3"].includes(id) : roles.includes("UART")) {
      issues.push(["warning", name + " berbagi jalur dengan USB–serial. Perangkat bisa mengganggu upload atau Serial Monitor."]);
    }
  }

  if (assignments.some(({ group }) => group === "relay")) {
    issues.push(["warning", "Periksa keadaan relay saat reset. Gunakan driver yang sesuai dan bias eksternal agar aktuator tetap nonaktif sebelum firmware berjalan."]);
  }
  return issues;
}

function mount(root) {
  let board = boards.devkit;
  let selected = board.first;
  let filter = "";
  let assignments = [];
  let activePreset = "monitor";
  let language = "arduino";

  root.innerHTML = `
    <header class="pin-lab-header">
      <label>Board
        <select data-board>
          ${Object.entries(boards).map(([id, item]) => `<option value="${id}">${item.label} · ${item.name}</option>`).join("")}
        </select>
      </label>
    </header>
    <div class="pin-lab-switch" role="group" aria-label="Mode lab">
      <button type="button" data-mode="explore" aria-pressed="true" aria-controls="pin-lab-explore">Eksplorasi pin</button>
      <button type="button" data-mode="plan" aria-pressed="false" aria-controls="pin-lab-plan">Perencanaan &amp; konflik</button>
    </div>
    <section id="pin-lab-explore" aria-label="Eksplorasi pin">
      <p>Pilih pin untuk melihat fungsi dan batasannya. Filter menyorot pin dengan kemampuan serupa.</p>
      <div class="pin-lab-chips" data-filters role="group" aria-label="Filter kemampuan"></div>
      <div class="pin-lab-columns">
        <div class="pin-lab-board" data-map aria-label="Skema header board"></div>
        <div class="pin-lab-inspector" data-inspector aria-live="polite"></div>
      </div>
    </section>
    <section id="pin-lab-plan" aria-label="Perencanaan dan konflik" hidden>
      <p>Pilih skenario atau susun kebutuhan sendiri. Ubah pin tiap sinyal untuk melihat konflik langsung.</p>
      <div class="pin-lab-chips" role="group" aria-label="Skenario proyek">
        ${Object.entries(presets).map(([id, preset]) => `<button type="button" data-preset="${id}">${preset.label}</button>`).join("")}
        <button type="button" data-preset="clear">Kosongkan</button>
      </div>
      <div class="pin-lab-plan-grid">
        <fieldset data-groups><legend>Kebutuhan proyek</legend></fieldset>
        <div>
          <div data-assignments></div>
          <div class="pin-lab-result" data-result role="status"></div>
        </div>
      </div>
      <small class="pin-lab-plan-note">Jika pin bus diubah, sesuaikan konfigurasi firmware. Cek level tegangan dan suplai sebelum merangkai.</small>
    </section>`;

  const find = (selector) => root.querySelector(selector);

  function updateExample() {
    const code = find("[data-example]");
    if (!code) return;
    code.textContent = exampleFor(board, selected, pinRoles(board, selected), language);
    find("[data-copy-status]").textContent = "";
    root.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
  }

  function inspect() {
    const roles = pinRoles(board, selected);
    const item = pin(board, selected);
    const notes = [item.note, ...roles.map((role) => roleNotes[role])].filter(Boolean);
    if (board.family === "esp32" && roles.includes("Input")) {
      notes.push("Gunakan resistor eksternal jika perlu pull-up atau pull-down.");
    }
    if (roles.includes("I²C")) notes.push("SDA dan SCL membutuhkan pull-up ke level logika bus. Beberapa modul sudah menyertakan resistor ini.");
    const facts = pinFacts(board, selected, roles);
    const hasCode = Boolean(exampleFor(board, selected, roles, "arduino"));
    if (board.family === "uno") language = "arduino";
    const codeOpen = find("[data-code-panel]")?.open;
    find("[data-inspector]").innerHTML = `
      <h3>${pinLabel(board, selected)}</h3>
      <div class="pin-lab-tags">${roles.map((role) => `<span>${role}</span>`).join("")}</div>
      ${facts.length ? `<dl class="pin-lab-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>` : ""}
      ${notes.length ? `<div class="pin-lab-notes"><strong>Catatan teknis</strong><ul>${notes.map((note) => `<li>${note}</li>`).join("")}</ul></div>` : "<p>Pin ini dapat dibaca atau dikendalikan sebagai I/O digital.</p>"}
      ${hasCode ? `<details data-code-panel ${codeOpen ? "open" : ""}>
        <summary>Contoh pembacaan pin</summary>
        <div class="pin-lab-chips pin-lab-code-controls">
          <button type="button" data-language="arduino">Arduino C++</button>
          ${board.family === "uno" ? "" : '<button type="button" data-language="python">MicroPython</button>'}
          <button type="button" data-copy>Salin kode</button>
        </div>
        <pre><code data-example></code></pre>
        <small data-copy-status role="status"></small>
      </details>` : ""}`;
    updateExample();
    root.querySelectorAll("[data-component]").forEach((button) => button.setAttribute("aria-pressed", "false"));
    root.querySelectorAll("[data-pin]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.pin === selected));
    });
  }

  function highlight() {
    root.querySelectorAll("[data-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    });
    root.querySelectorAll("[data-pin]").forEach((button) => {
      button.classList.toggle("is-muted", Boolean(filter && !pinRoles(board, button.dataset.pin).includes(filter)));
    });
  }

  function renderExplore() {
    const availableRoles = new Set(allPins(board).flatMap((id) => pinRoles(board, id)));
    find("[data-filters]").innerHTML = ["", ...filters.filter((role) => availableRoles.has(role))]
      .map((role) => `<button type="button" data-filter="${role}">${role || "Semua pin"}</button>`).join("");
    const column = (line, label) => `<div class="pin-lab-header-pins" role="group" aria-label="${label}">
      ${ids(line).map((id) => {
        const roles = pinRoles(board, id);
        const tone = id === "GND" ? "ground"
          : roles.includes("Boot") ? "caution"
          : roles.includes("Daya") || roles.includes("Reset") ? "power"
          : roles.includes("Input") ? "input"
          : roles.some((role) => ["UART", "Flash"].includes(role)) ? "serial" : "digital";
        const alias = board.family === "esp32" ? headerAliases[id] : "";
        return `<button type="button" data-pin="${id}" data-tone="${tone}">${pinLabel(board, id)}${alias ? ` <span>${alias}</span>` : ""}</button>`;
      }).join("")}
    </div>`;
    find("[data-map]").innerHTML = `
      <ul class="pin-lab-legend" aria-label="Legenda warna">
        ${[["power", "Daya / reset"], ["ground", "GND"], ["digital", "I/O"], ["caution", "Strapping"], ["input", "Input saja"], ["serial", "UART / flash"]].map(([tone, label]) => `<li data-tone="${tone}">${label}</li>`).join("")}
      </ul>
      ${column(board.left, "Header kiri")}
      <div class="pin-lab-board-body" data-family="${board.family}">
        <span class="pin-lab-mounts" aria-hidden="true"></span>
        ${board.family !== "uno" ? '<button type="button" data-component="antenna" class="pin-lab-antenna">Antena PCB</button>' : ''}
        <div class="pin-lab-chip">
          <span>${board.family === "uno" ? "MICROCHIP / ATMEL" : "ESPRESSIF"}</span>
          <strong>${{ esp32: "ESP32-WROOM-32", esp8266: "ESP-12E · ESP8266", uno: "ATmega328P" }[board.family]}</strong>
          <span>${{ esp32: "Wi-Fi 2.4G · BT/BLE", esp8266: "Wi-Fi 2.4G", uno: "AVR · 8-bit" }[board.family]}</span>
        </div>
        <div class="pin-lab-leds" aria-hidden="true"><span>● PWR</span><span>● ${board.family === "uno" ? "L · D13" : "STATUS"}</span></div>
        <button type="button" data-component="chip">${board.family === "uno" ? "Mikrokontroler" : "Modul radio + MCU"}</button>
        <button type="button" data-component="regulator">Regulator daya</button>
        <button type="button" data-component="bridge">USB–serial</button>
        <div class="pin-lab-board-controls">
          <button type="button" data-component="reset">${board.family === "esp32" ? "EN" : "RESET"}</button>
          ${board.family !== "uno" ? `<button type="button" data-component="boot">${board.family === "esp32" ? "BOOT" : "FLASH"}</button>` : ""}
        </div>
        <button type="button" data-component="usb" class="pin-lab-port">USB</button>
        <span class="pin-lab-silkscreen">${board.name}<br>${board.spec}</span>
      </div>
      ${column(board.right, "Header kanan")}
      <small>${board.spec}<br>Skema edukatif, bukan gambar skala. Posisi komponen dan jenis USB dapat berbeda antar varian.</small>`;
    inspect();
    highlight();
  }

  function renderNeeds() {
    find("[data-groups]").innerHTML = `
      <legend>Kebutuhan proyek</legend>
      ${board.family === "uno" ? "" : '<label><input type="checkbox" data-wifi> Wi-Fi aktif</label>'}
      ${Object.entries(signalGroups).filter(([, group]) => group.defaults[board.family])
        .map(([id, group]) => `<label><input type="checkbox" data-group="${id}"> ${group.label}</label>`).join("")}`;
  }

  function updateResult() {
    const issues = analyze(board, assignments, Boolean(find("[data-wifi]")?.checked));
    const errors = issues.filter(([type]) => type === "error").length;
    const title = errors ? `${errors} konflik perlu diperbaiki` : issues.length ? "Periksa catatan berikut" : "Tidak ada konflik pin yang terdeteksi";
    find("[data-result]").dataset.state = errors ? "error" : issues.length ? "warning" : "ok";
    find("[data-result]").innerHTML = assignments.length
      ? `<strong>${title}</strong>${issues.length ? `<ul>${issues.map(([, message]) => `<li>${message}</li>`).join("")}</ul>` : ""}`
      : "Pilih kebutuhan proyek untuk mulai merencanakan pin.";
  }

  function renderPlan() {
    const pins = allPins(board).filter((id) => board.pins[id] && !["NC", "AREF", "IOREF"].includes(id));
    const previous = new Map(assignments.map((item) => [item.group + item.signal, item.id]));
    assignments = [...root.querySelectorAll("[data-group]:checked")].flatMap(({ dataset }) => {
      const group = dataset.group;
      return signalGroups[group].signals.map((signal, index) => ({
        group, signal, index, id: previous.get(group + signal) ?? signalGroups[group].defaults[board.family][index],
      }));
    });
    find("[data-assignments]").innerHTML = assignments.map(({ group, signal, id }, row) => `
      <label class="pin-lab-assignment">
        <span>${signalGroups[group].label}<small>${signal}</small></span>
        <select data-assignment="${row}">
          <option value="">Pilih pin</option>
          ${pins.map((choice) => `<option value="${choice}" ${choice === id ? "selected" : ""}>${pinLabel(board, choice)}</option>`).join("")}
        </select>
      </label>`).join("");
    updateResult();
  }

  function applyPreset(name) {
    const preset = presets[name];
    activePreset = name;
    assignments = name === "conflict" ? [{ group: "analog", signal: "ADC", id: conflictPin[board.family] }] : [];
    const wifi = find("[data-wifi]");
    if (wifi) wifi.checked = Boolean(preset?.wifi);
    root.querySelectorAll("[data-group]").forEach((input) => {
      input.checked = Boolean(preset?.groups.includes(input.dataset.group));
    });
    updatePresetButtons();
    renderPlan();
  }

  function updatePresetButtons() {
    root.querySelectorAll("[data-preset]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.preset === activePreset));
    });
  }

  root.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.component) {
      const descriptions = {
        antenna: ["Antena PCB", "Jalur antena pada modul digunakan untuk komunikasi radio. Area ini berbeda dari header GPIO."],
        chip: ["Mikrokontroler", `${board.label} menjalankan firmware dan mengendalikan periferal melalui pin. ${board.family === "uno" ? "ATmega328P adalah MCU utama pada Uno R3." : "Modul menggabungkan MCU, flash, dan rangkaian radio."}`],
        regulator: ["Regulator daya", "Mengatur tegangan suplai untuk komponen board. VIN, rel daya, dan level logika GPIO bukan hal yang sama; ikuti spesifikasi varian board."],
        bridge: ["USB–serial", "Menjembatani komunikasi komputer dan UART untuk upload firmware serta Serial Monitor. Chip bridge bergantung varian board."],
        reset: ["Reset / enable", "Memulai ulang program pada board. Ini tidak menghapus firmware yang tersimpan di flash."],
        boot: ["BOOT / FLASH", "Digunakan bersama reset untuk masuk mode download firmware. Tombol ini berkaitan dengan level pin boot saat reset."],
        usb: ["Konektor USB", "Menghubungkan suplai daya dan jalur data komputer melalui USB–serial. Gunakan kabel yang mendukung data untuk upload."],
      };
      const [title, description] = descriptions[button.dataset.component];
      find("[data-inspector]").innerHTML = `<h3>${title}</h3><p>${description}</p><small>Klik pin header untuk kembali ke detail pin.</small>`;
      root.querySelectorAll("[data-pin], [data-component]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      return;
    }
    const { mode, pin: id, filter: role, preset } = button.dataset;
    if (mode) {
      root.querySelectorAll("[data-mode]").forEach((item) => {
        const active = item === button;
        item.setAttribute("aria-pressed", String(active));
        find("#" + item.getAttribute("aria-controls")).hidden = !active;
      });
    }
    if (id) {
      selected = id;
      inspect();
    }
    if (role !== undefined) {
      filter = role;
      highlight();
    }
    if (preset) applyPreset(preset);
    if (button.dataset.language) {
      language = button.dataset.language;
      updateExample();
    }
    if (button.hasAttribute("data-copy")) {
      const status = find("[data-copy-status]");
      try {
        await navigator.clipboard.writeText(find("[data-example]").textContent);
        status.textContent = "Kode disalin.";
      } catch {
        status.textContent = "Pilih teks kode untuk menyalinnya secara manual.";
      }
    }
  });

  root.addEventListener("change", ({ target }) => {
    if (target.matches("[data-board]")) {
      board = boards[target.value];
      selected = board.first;
      filter = "";
      renderExplore();
      renderNeeds();
      applyPreset(activePreset ?? "monitor");
      return;
    }
    activePreset = null;
    updatePresetButtons();
    if (target.matches("[data-group]")) {
      renderPlan();
    } else {
      if (target.matches("[data-assignment]")) assignments[target.dataset.assignment].id = target.value;
      updateResult();
    }
  });

  renderExplore();
  renderNeeds();
  applyPreset(activePreset);
}

function initialize() {
  const lab = document.querySelector("[data-pin-lab]:not([data-ready])");
  if (!lab) return;
  mount(lab);
  lab.dataset.ready = "";
  mountPractice(lab, "pin");
}

if (typeof document$ !== "undefined") document$.subscribe(initialize);
else initialize();
