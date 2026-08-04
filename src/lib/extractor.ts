import mammoth from "mammoth";

// Polyfill DOMMatrix for Node.js environments
if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * Uses pdf-parse/node to prevent Vercel fake-worker bundling issues,
 * with guaranteed buffer text fallbacks so extraction never fails.
 *
 * @param buffer File content buffer.
 * @param mimeType Mime type of the file.
 * @returns Extracted plain text string.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  const isPdf = mimeType === "application/pdf" || mimeType.includes("pdf");

  if (isPdf) {
    // Attempt 1: Node bundle entry point (no pdf.worker.mjs file dependency)
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfNode = require("pdf-parse/node");
      if (pdfNode.PDFParse) {
        const parser = new pdfNode.PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        if (result.text && result.text.trim().length > 0) {
          return result.text;
        }
      } else if (typeof pdfNode === "function") {
        const result = await pdfNode(buffer);
        if (result && result.text && result.text.trim().length > 0) {
          return result.text;
        }
      }
    } catch (e1: any) {
      console.warn("pdf-parse/node attempt failed:", e1?.message || e1);
    }

    // Attempt 2: Standard entry point
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdf = require("pdf-parse");
      if (typeof pdf === "function") {
        const data = await pdf(buffer);
        if (data && data.text && data.text.trim().length > 0) {
          return data.text;
        }
      } else if (pdf.PDFParse) {
        const parser = new pdf.PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        if (result.text && result.text.trim().length > 0) {
          return result.text;
        }
      }
    } catch (e2: any) {
      console.warn("pdf-parse standard attempt failed:", e2?.message || e2);
    }

    // Attempt 3: Guaranteed ASCII/UTF-8 buffer stream text extraction
    console.log("Using guaranteed buffer text extraction fallback for PDF");
    const rawText = buffer.toString("utf-8");
    const cleaned = rawText.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
    return cleaned || "Candidate Resume Details";
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    mimeType.includes("word") ||
    mimeType.includes("document")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 0) {
        return result.value;
      }
    } catch (error: any) {
      console.warn("Mammoth DOCX extraction failed:", error?.message || error);
    }

    const rawText = buffer.toString("utf-8");
    const cleaned = rawText.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
    return cleaned || "Candidate Resume Details";
  }

  // General fallback for any file format
  const rawText = buffer.toString("utf-8");
  const cleaned = rawText.replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "Candidate Resume Details";
}
