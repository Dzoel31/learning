const projectFiles = [
  { archiveName: "db.py", linkName: "db.py" },
  { archiveName: "seed_db.py", linkName: "seed_db.py" },
  { archiveName: "mcp_server.py", linkName: "mcp_server.py" },
  { archiveName: "mcp_chat.py", linkName: "mcp_chat.py" },
  { archiveName: "streamlit_app.py", linkName: "streamlit_app.py" },
  { archiveName: "gradio_app.py", linkName: "gradio_app.py" },
  { archiveName: ".env.example", linkName: "env.example" },
  { archiveName: ".gitignore", linkName: "gitignore.template" },
];

const encoder = new TextEncoder();
const crcTable = new Uint32Array(256);
for (let index = 0; index < crcTable.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

function crc32(bytes) {
  let checksum = 0xffffffff;
  for (const byte of bytes) {
    checksum = crcTable[(checksum ^ byte) & 0xff] ^ (checksum >>> 8);
  }
  return (checksum ^ 0xffffffff) >>> 0;
}

function writeZip(files) {
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((Math.max(now.getFullYear(), 1980) - 1980) << 9)
    | ((now.getMonth() + 1) << 5)
    | now.getDate();
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.bytes);
    const localHeader = new Uint8Array(30 + name.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, file.bytes.length, true);
    localView.setUint32(22, file.bytes.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(name, 30);
    localParts.push(localHeader, file.bytes);

    const centralHeader = new Uint8Array(46 + name.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, file.bytes.length, true);
    centralView.setUint32(24, file.bytes.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(name, 46);
    centralParts.push(centralHeader);

    localOffset += localHeader.length + file.bytes.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
}

async function fetchProjectFiles() {
  const links = [...document.querySelectorAll('a[href*="/assets/ai-labs/mcp-postgresql-chat/"]')];
  const linksByName = new Map(links.map((link) => {
    const path = new URL(link.href).pathname;
    return [decodeURIComponent(path.split("/").pop()), link.href];
  }));
  const missing = projectFiles.filter((file) => !linksByName.has(file.linkName));
  if (missing.length > 0) {
    throw new Error(`Tautan berkas tidak ditemukan: ${missing.map((file) => file.archiveName).join(", ")}`);
  }

  return Promise.all(projectFiles.map(async ({ archiveName, linkName }) => {
    const response = await fetch(linksByName.get(linkName), { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Gagal mengambil ${archiveName} (${response.status}).`);
    return { name: archiveName, bytes: new Uint8Array(await response.arrayBuffer()) };
  }));
}

function initializeZipButton() {
  const button = document.querySelector("#download-mcp-zip:not([data-ready])");
  if (!button) return;

  const status = document.querySelector("#mcp-zip-status");
  button.dataset.ready = "";
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    if (button.dataset.busy === "true") return;
    button.dataset.busy = "true";
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-disabled", "true");
    button.classList.add("disabled");
    if (status) status.textContent = "Mengambil berkas dan menyusun ZIP…";

    try {
      const files = await fetchProjectFiles();
      const archive = writeZip(files);
      const objectUrl = URL.createObjectURL(archive);
      const download = document.createElement("a");
      download.href = objectUrl;
      download.download = "mcp-postgresql-chat.zip";
      download.hidden = true;
      document.body.append(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      if (status) status.textContent = `ZIP siap diunduh (${files.length} berkas).`;
    } catch (error) {
      if (status) status.textContent = `ZIP gagal dibuat: ${error.message}`;
    } finally {
      delete button.dataset.busy;
      button.removeAttribute("aria-busy");
      button.removeAttribute("aria-disabled");
      button.classList.remove("disabled");
    }
  });
}

if (typeof document$ !== "undefined") document$.subscribe(initializeZipButton);
else initializeZipButton();
