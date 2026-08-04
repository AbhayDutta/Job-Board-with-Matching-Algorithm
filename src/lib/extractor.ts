import mammoth from "mammoth";

// Polyfill DOMMatrix for Node.js environments
if (typeof global !== "undefined" && !(global as any).DOMMatrix) {
  (global as any).DOMMatrix = class DOMMatrix {};
}

/**
 * Strips out raw PDF binary tags, stream objects, XML structures, and PDF headers.
 */
export function cleanPdfBinaryArtifacts(text: string): string {
  if (!text) return "";

  // Remove XML/RDF metadata blocks that Canva or Adobe PDF generators embed
  let cleaned = text.replace(/<\?xpacket[\s\S]*?\?>/gi, "");
  cleaned = cleaned.replace(/<rdf:RDF[\s\S]*?<\/rdf:RDF>/gi, "");
  cleaned = cleaned.replace(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/gi, "");
  cleaned = cleaned.replace(/<<[\s\S]*?>>/g, " ");

  const lines = cleaned.split("\n");
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;

    // Filter out standard PDF structure strings
    if (
      trimmed.startsWith("%PDF-") ||
      trimmed.includes("ReportLab") ||
      trimmed.includes("Canva") ||
      trimmed.includes("Adobe") ||
      trimmed.includes("obj") ||
      trimmed.includes("endobj") ||
      trimmed.includes("stream") ||
      trimmed.includes("endstream") ||
      trimmed.includes("/BaseFont") ||
      trimmed.includes("/Font") ||
      trimmed.includes("/Type") ||
      trimmed.includes("/Pages") ||
      trimmed.includes("/StructTreeRoot") ||
      trimmed.includes("/Metadata") ||
      trimmed.includes("/MediaBox") ||
      trimmed.includes("/ProcSet") ||
      trimmed.includes("/XObject") ||
      trimmed.includes("/FlateDecode") ||
      trimmed.includes("xmlns:") ||
      trimmed.includes("rdf:") ||
      /^[\d\s]+obj$/.test(trimmed) ||
      /^\d+\s+\d+\s+R$/.test(trimmed) ||
      /^<<.*>>$/.test(trimmed)
    ) {
      return false;
    }

    // Must contain some printable word characters
    return /[a-zA-Z0-9]/.test(trimmed);
  });

  return filtered.join("\n").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Extracts raw text from a PDF or DOCX file buffer.
 * Filters out raw binary PDF structure tags to ensure clean human text.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  const isPdf = mimeType === "application/pdf" || mimeType.includes("pdf");

  if (isPdf) {
    // Attempt 1: Node bundle entry point
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfNode = require("pdf-parse/node");
      if (pdfNode.PDFParse) {
        const parser = new pdfNode.PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        if (result.text && result.text.trim().length > 0) {
          const cleanedText = cleanPdfBinaryArtifacts(result.text);
          if (cleanedText.length > 20) return cleanedText;
        }
      } else if (typeof pdfNode === "function") {
        const result = await pdfNode(buffer);
        if (result && result.text && result.text.trim().length > 0) {
          const cleanedText = cleanPdfBinaryArtifacts(result.text);
          if (cleanedText.length > 20) return cleanedText;
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
          if (cleanedText.length > 20) return cleanedText;
        }
      } else if (pdf.PDFParse) {
        const parser = new pdf.PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        if (result.text && result.text.trim().length > 0) {
          const cleanedText = cleanPdfBinaryArtifacts(result.text);
          if (cleanedText.length > 20) return cleanedText;
        }
      }
    } catch (e2: any) {
      console.warn("pdf-parse standard attempt failed:", e2?.message || e2);
    }

    // Attempt 3: Buffer string extraction with deep binary filtering
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
