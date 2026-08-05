const PDFParser = require("pdf2json");

function safeDecodeComponent(str) {
  if (!str) return "";
  try {
    return decodeURIComponent(str);
  } catch {
    try {
      return unescape(str);
    } catch {
      return str;
    }
  }
}

function parsePdf2JsonData(data) {
  const pages = data?.Pages || [];
  const lines = [];

  for (const page of pages) {
    let lastY = -1;
    let currentLine = [];

    const texts = page?.Texts || [];
    // Sort texts by y coordinate (line position) then x coordinate
    texts.sort((a, b) => a.y - b.y || a.x - b.x);

    for (const t of texts) {
      const decoded = t?.R?.map((r) => safeDecodeComponent(r?.T)).join("") || "";
      if (!decoded.trim()) continue;

      // If y coordinate difference is > 0.4, start a new line!
      if (lastY >= 0 && Math.abs(t.y - lastY) > 0.4) {
        lines.push(currentLine.join(" "));
        currentLine = [];
      }

      currentLine.push(decoded.trim());
      lastY = t.y;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine.join(" "));
    }
  }

  return lines.join("\n");
}

console.log("pdf2json helper loaded");
