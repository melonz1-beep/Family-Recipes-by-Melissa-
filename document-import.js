(() => {
  const byId = id => document.getElementById(id);
  const supportedExtensions = ["pdf", "docx", "txt", "md"];

  function setStatus(message, isError = false) {
    const status = byId("documentImportStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error-note", isError);
  }

  function filenameTitle(filename) {
    return String(filename || "Imported Recipe")
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "Imported Recipe";
  }

  function fileExtension(file) {
    return String(file?.name || "").split(".").pop().toLowerCase();
  }

  function populateCategories() {
    const select = byId("documentImportCategory");
    if (!select) return;
    const categories = Array.isArray(window.MELISSA_RECIPE_CATEGORIES)
      ? window.MELISSA_RECIPE_CATEGORIES
      : ["Other"];
    select.innerHTML = categories
      .map(category => `<option ${category === "Family Favorites" ? "selected" : ""}>${escapeHtml(category)}</option>`)
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[character]));
  }

  function cleanExtractedText(text) {
    const lines = String(text || "")
      .replace(/\r/g, "")
      .split("\n")
      .map(line => line.replace(/[\t ]+/g, " ").trim());

    const counts = new Map();
    lines.filter(Boolean).forEach(line => {
      const key = line.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    // Remove repeated page headers, footers, standalone page numbers and URLs.
    // The actual recipe wording remains unchanged.
    return lines
      .filter(line => {
        if (!line) return true;
        if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(line)) return false;
        if (/^\d+\s*\/\s*\d+$/.test(line)) return false;
        if (/^https?:\/\//i.test(line) || /^www\./i.test(line)) return false;
        const key = line.toLowerCase();
        return !(counts.get(key) > 2 && line.length < 90);
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function textItemsToLines(items) {
    const rows = new Map();

    items.forEach(item => {
      const text = String(item.str || "").trim();
      if (!text) return;
      const x = Number(item.transform?.[4] || 0);
      const y = Math.round(Number(item.transform?.[5] || 0) / 3) * 3;
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push({ x, text });
    });

    return [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, row]) => row.sort((a, b) => a.x - b.x).map(item => item.text).join(" "))
      .join("\n");
  }

  async function extractPdf(file) {
    if (!window.pdfjsLib) {
      throw new Error("The PDF reader did not load. Check your internet connection and try again.");
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      setStatus(`Reading PDF page ${pageNumber} of ${pdf.numPages}...`);
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(textItemsToLines(content.items));
    }

    return pages.join("\n\n");
  }

  async function extractDocx(file) {
    if (!window.mammoth) {
      throw new Error("The Word document reader did not load. Check your internet connection and try again.");
    }

    setStatus("Reading Word document...");
    const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value || "";
  }

  async function extractPlainText(file) {
    setStatus("Reading document text...");
    return file.text();
  }

  async function readDocument(file) {
    const extension = fileExtension(file);
    if (!supportedExtensions.includes(extension)) {
      throw new Error("Choose a PDF, DOCX, TXT, or Markdown document.");
    }

    if (extension === "pdf") return extractPdf(file);
    if (extension === "docx") return extractDocx(file);
    return extractPlainText(file);
  }

  function parseDocumentRecipe(text, file) {
    const cleaned = cleanExtractedText(text);
    if (!cleaned) throw new Error("No readable recipe text was found in this document.");

    const parsed = typeof window.parseRecipeText === "function"
      ? window.parseRecipeText(cleaned)
      : { title: filenameTitle(file.name), ingredients: "", directions: cleaned, notes: "" };

    const genericTitle = !parsed.title || /^(imported recipe|untitled recipe)$/i.test(parsed.title);
    if (genericTitle || parsed.title.length > 120) parsed.title = filenameTitle(file.name);

    const sourceNote = `Imported from ${file.name}. The original document was not saved.`;
    parsed.notes = parsed.notes ? `${parsed.notes}\n${sourceNote}` : sourceNote;

    return parsed;
  }

  async function extractDocumentRecipe() {
    const file = byId("documentImportFile")?.files?.[0];
    if (!file) {
      alert("Choose a recipe document first.");
      return;
    }

    const button = byId("extractDocumentBtn");
    if (button) button.disabled = true;
    setStatus("Opening document...");

    try {
      const text = await readDocument(file);
      const parsed = parseDocumentRecipe(text, file);
      const category = byId("documentImportCategory")?.value || "Other";

      if (typeof window.openRecipeEditor !== "function") {
        throw new Error("The recipe editor is not ready. Close and reopen the binder, then try again.");
      }

      window.openRecipeEditor(null, {
        category,
        title: parsed.title,
        ingredients: parsed.ingredients,
        directions: parsed.directions,
        notes: parsed.notes,
        rating: "",
        photo: ""
      });

      byId("documentImportPanel")?.classList.add("hidden");
      setStatus("Recipe extracted. Review the ingredients and directions, then tap Save Recipe.");

      if (!parsed.ingredients || !parsed.directions) {
        alert("The document was read, but one section could not be separated confidently. Review the extracted recipe before saving.");
      }
    } catch (error) {
      console.error(error);
      setStatus(error.message || "The document could not be read.", true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function bindDocumentImport() {
    populateCategories();

    byId("openDocumentImportBtn")?.addEventListener("click", () => {
      byId("documentImportPanel")?.classList.remove("hidden");
      setStatus("Ready to read a document.");
    });

    byId("closeDocumentImportBtn")?.addEventListener("click", () => {
      byId("documentImportPanel")?.classList.add("hidden");
    });

    byId("extractDocumentBtn")?.addEventListener("click", extractDocumentRecipe);

    byId("documentImportFile")?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      setStatus(file ? `Selected: ${file.name}` : "Ready to read a document.");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindDocumentImport, { once: true });
  } else {
    bindDocumentImport();
  }
})();
