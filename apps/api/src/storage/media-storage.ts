/** Private storage boundary. HTTP serving and upload endpoints are intentionally deferred. */
export interface MediaWrite { content: Buffer; contentType: string; }
export interface StoredMedia { id: string; byteSize: number; contentType: string; }
export interface MediaStorage { put(input: MediaWrite): Promise<StoredMedia>; read(id: string): Promise<Buffer>; }
export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE');
