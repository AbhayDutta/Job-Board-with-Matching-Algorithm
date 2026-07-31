// Polyfill DOMMatrix for Node.js environments (required for pdf-parse/pdfjs-dist module initialization)
if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}

import mammoth from "mammoth";
const pdf = require("pdf-parse");

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 *
 * @param buffer File content buffer.
 * @param mimeType Mime type of the file.
 * @returns Extracted plain text string.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      const parser = new pdf.PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      await parser.destroy(); // Clean up parser resources
      return result.text || "";
    } catch (error: any) {
      console.error("PDF extraction failed:", error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (error: any) {
      console.error("DOCX extraction failed:", error);
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported file type: ${mimeType}. Only PDF and DOCX files are allowed.`);
  }
}
