import { Request } from 'express';
const Busboy = require('busboy');

export interface ParsedFile {
  buffer:   Buffer;
  mimetype: string;
  size:     number;
}

export interface ParsedForm {
  file:   ParsedFile | null;
  fields: Record<string, string>;
}

export function parseMultipart(req: Request): Promise<ParsedForm> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields: Record<string, string> = {};
    let file: ParsedFile | null = null;

    busboy.on('file', (name: string, stream: any, info: any) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        file = { buffer, mimetype: info.mimeType, size: buffer.length };
      });
      stream.on('error', reject);
    });

    busboy.on('field', (name: string, value: string) => {
      fields[name] = value;
    });

    busboy.on('finish', () => resolve({ file, fields }));
    busboy.on('error', reject);

    // FIX FOR FIREBASE CLOUD FUNCTIONS:
    // Firebase often populates req.rawBody and consumes the stream.
    if ((req as any).rawBody) {
      busboy.end((req as any).rawBody);
    } else {
      req.pipe(busboy);
    }
  });
}
