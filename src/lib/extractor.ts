import mammoth from "mammoth";

// Polyfill DOMMatrix for Node.js environments
if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 *
 * @param buffer File content buffer.
 * @param mimeType Mime type of the file.
 * @returns Extracted plain text string.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  const isPdf = mimeType === "application/pdf" || mimeType.includes("pdf");

  if (isPdf) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdf = require("pdf-parse");
      const data = typeof pdf === "function" ? await pdf(buffer) : await (pdf.default || pdf)(buffer);
      if (data && data.text && data.text.trim().length > 0) {
        return data.text;
      }
    } catch (error: any) {
      console.warn("PDF parse failed, using raw text extractor fallback:", error?.message || error);
    }

    // Fallback: Clean printable ASCII text from buffer
    const rawText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
    return rawText;
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

    return buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
  }

  // General fallback for any file format
  return buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
}
