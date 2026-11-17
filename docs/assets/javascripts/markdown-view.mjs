function initializeMarkdownView() {
  const alternate = document.querySelector('link[rel="alternate"][type="text/markdown"]');
  const article = document.querySelector(".md-content__inner");
  const heading = article?.querySelector("h1");
  if (!alternate || !heading || article.querySelector(".md-markdown-view")) return;

  const action = document.createElement("div");
  action.className = "md-markdown-view";
  action.innerHTML = `
    <button type="button">View as Markdown</button>
    <dialog class="md-markdown-dialog" aria-label="Markdown halaman">
      <header>
        <strong>Markdown halaman</strong>
        <a data-markdown-source>Buka berkas .md</a>
        <form method="dialog"><button type="submit">Tutup</button></form>
      </header>
      <p role="status"></p>
      <pre hidden><code></code></pre>
    </dialog>`;
  heading.after(action);

  const button = action.querySelector("button");
  const dialog = action.querySelector("dialog");
  const status = dialog.querySelector("[role=status]");
  const preview = dialog.querySelector("pre");
  const code = preview.querySelector("code");
  const source = dialog.querySelector("[data-markdown-source]");
  source.href = alternate.href;
  let loaded = false;

  button.addEventListener("click", async () => {
    dialog.showModal();
    if (loaded) return;
    status.textContent = "Memuat Markdown…";
    try {
      const response = await fetch(source.href);
      if (!response.ok) throw new Error(response.statusText);
      code.textContent = await response.text();
      preview.hidden = false;
      status.textContent = "";
      loaded = true;
    } catch {
      status.textContent = "Markdown gagal dimuat. Coba lagi atau buka berkas .md.";
    }
  });
  dialog.addEventListener("close", () => button.focus());
}

if (typeof document$ !== "undefined") document$.subscribe(initializeMarkdownView);
else initializeMarkdownView();
