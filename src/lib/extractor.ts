import mammoth from "mammoth";

/**
 * Extracts clean human-readable text from a PDF buffer using pdf2json.
 * pdf2json is a pure Node.js parser — no web workers, no browser APIs.
 * Works natively in Vercel serverless functions.
 */
async function extractPdfWithPdf2json(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFParser = require("pdf2json");
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData?.parserError || "pdf2json parse error"));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        // pdf2json stores decoded text in pdfData.Pages[].Texts[].R[].T
        const pages: any[] = pdfData?.Pages || [];
        const lines: string[] = [];

        for (const page of pages) {
          const texts: any[] = page?.Texts || [];
          const pageTokens: string[] = [];
          for (const textItem of texts) {
            const runs: any[] = textItem?.R || [];
            for (const run of runs) {
              if (run?.T) {
                pageTokens.push(decodeURIComponent(run.T));
              }
            }
          }
          if (pageTokens.length > 0) {
            lines.push(pageTokens.join(" "));
          }
        }

        const fullText = lines.join("\n").replace(/\s{3,}/g, "  ").trim();
        resolve(fullText);
      } catch (e: any) {
        reject(new Error("pdf2json data extraction failed: " + e.message));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * PDF: Uses pdf2json (pure Node.js, Vercel-safe).
 * DOCX: Uses mammoth.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const isPdf =
    mimeType === "application/pdf" || mimeType.toLowerCase().includes("pdf");

  if (isPdf) {
    // Primary: pdf2json — pure Node.js, no worker, works on Vercel
    try {
      const text = await extractPdfWithPdf2json(buffer);
      if (text && text.trim().length > 20) {
        console.log(
          "[Extractor] pdf2json extracted",
          text.length,
          "chars from PDF"
        );
        return text.trim();
      }
    } catch (e1: any) {
      console.warn("[Extractor] pdf2json failed:", e1?.message || e1);
    }

    // Fallback: printable ASCII extraction from buffer
    console.warn("[Extractor] Falling back to buffer string extraction");
    const rawText = buffer
      .toString("latin1")
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s{4,}/g, "\n")
      .trim();
    return rawText;
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    mimeType.toLowerCase().includes("word") ||
    mimeType.toLowerCase().includes("document")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        console.log("[Extractor] mammoth extracted", result.value.length, "chars from DOCX");
        return result.value.trim();
      }
    } catch (error: any) {
      console.warn("[Extractor] Mammoth DOCX extraction failed:", error?.message || error);
    }
  }

  // Generic fallback
  return buffer
    .toString("latin1")
    .replace(/[^\x20-\x7E\n\r\t]/g, " ")
    .replace(/\s{4,}/g, "\n")
    .trim();
}
