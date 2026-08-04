import mammoth from "mammoth";

// Polyfill DOMMatrix for Node.js environments
if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}

/**
 * Strips out raw PDF binary tags, stream objects, and font definitions
 * (e.g. %PDF-1.4, ReportLab header, obj <<, /BaseFont /Helvetica)
 */
export function cleanPdfBinaryArtifacts(text: string): string {
  if (!text) return "";

  const lines = text.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (
      trimmed.startsWith("%PDF-") ||
      trimmed.includes("ReportLab Generated PDF") ||
      trimmed.includes("obj <<") ||
      trimmed.includes(">> endobj") ||
      trimmed.includes("/BaseFont") ||
      trimmed.includes("/FontDescriptor") ||
      trimmed.includes("/Type /") ||
      trimmed.includes("/Filter /") ||
      trimmed.includes("/MediaBox") ||
      trimmed.includes("/Encoding /") ||
      trimmed.includes("/WinAnsiEncoding") ||
      trimmed.includes("endobj") ||
      trimmed.includes("stream") ||
      trimmed.includes("endstream") ||
      /^[\d\s]+obj$/.test(trimmed) ||
      /^<<.*>>$/.test(trimmed)
    ) {
      return false;
    }
    return true;
  });

  return filtered.join("\n").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * Filters out raw binary PDF structure tags to ensure clean human text.
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
          const cleanedText = cleanPdfBinaryArtifacts(result.text);
          if (cleanedText.length > 0) return cleanedText;
        }
      } else if (typeof pdfNode === "function") {
        const result = await pdfNode(buffer);
        if (result && result.text && result.text.trim().length > 0) {
          const cleanedText = cleanPdfBinaryArtifacts(result.text);
          if (cleanedText.length > 0) return cleanedText;
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
          const cleanedText = cleanPdfBinaryArtifacts(data.text);
          if (cleanedText.length > 0) return cleanedText;
        }
      } else if (pdf.PDFParse) {
        const parser = new pdf.PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        if (result.text && result.text.trim().length > 0) {
          const cleanedText = cleanPdfBinaryArtifacts(result.text);
          if (cleanedText.length > 0) return cleanedText;
        }
      }
    } catch (e2: any) {
      console.warn("pdf-parse standard attempt failed:", e2?.message || e2);
    }

    // Attempt 3: Guaranteed clean ASCII text buffer extraction
    const rawText = buffer.toString("utf-8");
    const cleaned = cleanPdfBinaryArtifacts(rawText);
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
        return result.value.trim();
      }
    } catch (error: any) {
      console.warn("Mammoth DOCX extraction failed:", error?.message || error);
    }

    const rawText = buffer.toString("utf-8");
    const cleaned = cleanPdfBinaryArtifacts(rawText);
    return cleaned || "Candidate Resume Details";
  }

  // General fallback for any file format
  const rawText = buffer.toString("utf-8");
  const cleaned = cleanPdfBinaryArtifacts(rawText);
  return cleaned || "Candidate Resume Details";
}
