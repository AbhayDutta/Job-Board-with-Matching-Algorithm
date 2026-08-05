import mammoth from "mammoth";
import { join } from "path";
import { pathToFileURL } from "url";

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
 * Extracts text from a PDF buffer using pdfjs-dist.
 */
async function extractPdfWithPdfjs(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as string);

  const workerPath = join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const doc = await pdfjsLib
    .getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      verbosity: 0,
    })
    .promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .filter((item) => "str" in item)
      .map((item) => (item as any).str)
      .join(" ");
    pageTexts.push(pageText);
    page.cleanup();
  }

  await doc.destroy();
  return pageTexts.join("\n").replace(/[ \t]{3,}/g, "  ").trim();
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * PDF  → pdfjs-dist -> pdf2json (with safeDecodeComponent) -> ASCII fallback
 * DOCX → mammoth
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const mime = mimeType.toLowerCase();
  const isPdf = mime === "application/pdf" || mime.includes("pdf");

  // ── PDF Extraction ──────────────────────────────────────────────────────────
  if (isPdf) {
    try {
      const text = await extractPdfWithPdfjs(buffer);
      if (text && text.trim().length > 30) {
        console.log("[Extractor] pdfjs extracted", text.length, "chars");
        return text.trim();
      }
      console.warn("[Extractor] pdfjs returned empty text, trying pdf2json…");
    } catch (e1: any) {
      console.warn("[Extractor] pdfjs failed:", e1?.message);
    }

    // Secondary fallback: pdf2json with safeDecodeComponent
    try {
      const PDFParser = require("pdf2json"); // eslint-disable-line
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
      if (text && text.trim().length > 30) {
        console.log("[Extractor] pdf2json extracted", text.length, "chars");
        return text.trim();
      }
    } catch (e2: any) {
      console.warn("[Extractor] pdf2json failed:", e2?.message);
    }

    // Last resort: printable-ASCII scrape
    console.warn("[Extractor] Falling back to ASCII buffer scrape");
    return buffer
      .toString("latin1")
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s{4,}/g, "\n")
      .trim();
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
