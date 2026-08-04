(() => {
  const byId = id => document.getElementById(id);
  const supportedExtensions = ["pdf", "docx", "txt", "md"];

  function setStatus(message, isError = false) {
    const status = byId("documentImportStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error-note", isError);
  }

  function filename