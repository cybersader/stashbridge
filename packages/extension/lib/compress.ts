import LZString from 'lz-string';

export function compress(data: string): string {
  return LZString.compressToUTF16(data);
}

export function decompress(data: string): string {
  return LZString.decompressFromUTF16(data) ?? '';
}

export function compressJSON<T>(obj: T): string {
  return compress(JSON.stringify(obj));
}

export function decompressJSON<T>(data: string): T {
  return JSON.parse(decompress(data));
}

export function byteLength(str: string): number {
  return new Blob([str]).size;
}
