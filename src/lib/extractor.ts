import mammoth from "mammoth";

/**
 * Safely decodes URI components extracted by pdf2json.
 * Prevents URIError: URI malformed crashes when PDF text contains literal % symbols.
 */
function safeDecodeComponent(str: string): string {
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

/**
 * Extracts structured, line-by-line text from PDF via pdf2json.
 * Groups text items by Y coordinate so words on the same line stay together
 * and lines are separated by newlines — preserving resume section structure.
 */
async function extractPdfWithPdf2Json(buffer: Buffer): Promise<string> {
  const PDFParser = require("pdf2json"); // eslint-disable-line @typescript-eslint/no-require-imports

  return new Promise<string>((resolve, reject) => {
    const parser = new PDFParser(null, 1);

    parser.on("pdfParser_dataError", (err: any) =>
      reject(new Error(err?.parserError || "pdf2json parse error"))
    );

    parser.on("pdfParser_dataReady", (data: any) => {
      try {
        const pages: any[] = data?.Pages || [];
        const allLines: string[] = [];

        for (const page of pages) {
          // Group text items by Y coordinate (rounded to 1 decimal)
          const lineMap = new Map<number, Array<{ x: number; text: string }>>();

          for (const t of page?.Texts || []) {
            const y = Math.round(t.y * 10) / 10;
            const x = t.x || 0;
            const decoded = (t?.R || [])
              .map((r: any) => safeDecodeComponent(r?.T || ""))
              .join("");
            if (!decoded.trim()) continue;

            if (!lineMap.has(y)) lineMap.set(y, []);
            lineMap.get(y)!.push({ x, text: decoded });
          }

          // Sort lines by Y, then items within each line by X
          const sortedYs = Array.from(lineMap.keys()).sort((a, b) => a - b);
          for (const y of sortedYs) {
            const items = lineMap.get(y)!.sort((a, b) => a.x - b.x);
            const lineText = items.map((i) => i.text.trim()).filter(Boolean).join(" ");
            if (lineText.trim()) {
              allLines.push(lineText.trim());
            }
          }
        }

        resolve(allLines.join("\n").trim());
      } catch (e: any) {
        reject(new Error("pdf2json post-processing failed: " + e?.message));
      }
    });

    parser.parseBuffer(buffer);
  });
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * Engine 1: pdf2json with Y-coordinate line grouping (preserves resume structure)
 * Engine 2: Printable ASCII stream scrape (last resort)
 * DOCX: mammoth
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mime = (mimeType || "").toLowerCase();
  const isPdf =
    mime.includes("pdf") ||
    buffer.slice(0, 5).toString("utf8").startsWith("%PDF");

  // ── PDF Extraction ──────────────────────────────────────────────────────────
  if (isPdf) {
    // Engine 1: pdf2json with proper line grouping
    try {
      const text = await extractPdfWithPdf2Json(buffer);
      if (text && text.trim().length > 30) {
        console.log(
          `[Extractor] pdf2json extracted ${text.trim().length} characters (line-grouped).`
        );
        return text.trim();
      }
      console.warn("[Extractor] pdf2json returned too little text, trying fallback...");
    } catch (e1: any) {
      console.warn("[Extractor] pdf2json failed:", e1?.message || e1);
    }

    // Engine 2: ASCII stream scrape (last resort)
    console.warn("[Extractor] Falling back to ASCII stream scrape.");
    const scraped = buffer
      .toString("latin1")
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s{4,}/g, "\n")
      .trim();

    return scraped;
  }

  // ── DOCX Extraction ─────────────────────────────────────────────────────────
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        console.log("[Extractor] mammoth extracted", result.value.length, "chars");
        return result.value.trim();
      }
    } catch (err: any) {
      console.warn("[Extractor] mammoth failed:", err?.message);
    }
  }

  // Generic fallback
  return buffer
    .toString("latin1")
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s{4,}/g, "\n")
    .trim();
}
