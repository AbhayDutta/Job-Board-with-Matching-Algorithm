declare module "mammoth" {
  export interface ExtractionResult {
    value: string;
    messages: any[];
  }

  export function extractRawText(options: { buffer: Buffer }): Promise<ExtractionResult>;
  export function convertToHtml(options: { buffer: Buffer }): Promise<ExtractionResult>;
}
