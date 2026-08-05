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
 * Extracts text from PDF buffer using pdf-parse (Pure JS, zero worker dependency).
 */
async function extractPdfWithPdfParse(buffer: Buffer): Promise<string> {
  const { PDFParse } = require("pdf-parse"); // eslint-disable-line @typescript-eslint/no-require-imports
  const parser = new PDFParse({ data: buffer });
  await parser.load();
  const text = await parser.getText();
  return text || "";
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * Engine 1: pdf-parse (Pure JS, Vercel serverless compatible)
 * Engine 2: pdf2json (with safeDecodeComponent)
 * Engine 3: Printable ASCII & Stream Scrape
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mime = (mimeType || "").toLowerCase();
  const isPdf = mime.includes("pdf") || buffer.toString("utf8", 0, 5).startsWith("%PDF");

  // ── PDF Extraction ──────────────────────────────────────────────────────────
  if (isPdf) {
    // Engine 1: pdf-parse (Pure JS serverless)
    try {
      const text = await extractPdfWithPdfParse(buffer);
      if (text && text.trim().length > 20) {
        console.log(`[Extractor] pdf-parse extracted ${text.trim().length} characters.`);
        return text.trim();
      }
    } catch (e1: any) {
      console.warn("[Extractor] pdf-parse failed:", e1?.message || e1);
    }

    // Engine 2: pdf2json (Secondary fallback)
    try {
      const PDFParser = require("pdf2json"); // eslint-disable-line @typescript-eslint/no-require-imports
      const text = await new Promise<string>((resolve, reject) => {
        const parser = new PDFParser(null, 1);
        parser.on("pdfParser_dataError", (err: any) =>
          reject(new Error(err?.parserError || "pdf2json error"))
        );
        parser.on("pdfParser_dataReady", (data: any) => {
          const pages: any[] = data?.Pages || [];
          const tokens: string[] = [];
          for (const page of pages) {
            for (const t of page?.Texts || []) {
              for (const r of t?.R || []) {
                if (r?.T) {
                  tokens.push(safeDecodeComponent(r.T));
                }
              }
            }
          }
          resolve(tokens.join(" ").trim());
        });
        parser.parseBuffer(buffer);
      });

      if (text && text.trim().length > 20) {
        console.log(`[Extractor] pdf2json extracted ${text.trim().length} characters.`);
        return text.trim();
      }
    } catch (e2: any) {
      console.warn("[Extractor] pdf2json failed:", e2?.message || e2);
    }

    // Engine 3: Printable ASCII / Stream Scrape Fallback
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
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
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
