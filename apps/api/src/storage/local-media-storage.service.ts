import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Env } from '../config/env';
import type { MediaStorage, MediaWrite, StoredMedia } from './media-storage';

const signatures: Record<string, readonly number[]> = {
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'audio/wav': [0x52, 0x49, 0x46, 0x46],
};

function matchesSignature(content: Buffer, signature: readonly number[]): boolean { return content.length >= signature.length && signature.every((byte, index) => content[index] === byte); }

@Injectable()
export class LocalMediaStorageService implements MediaStorage {
  private readonly directory: string;
  private readonly maxBytes: number;
  constructor(@Inject(ConfigService) config: ConfigService<Env, true>) {
    const configured = config.getOrThrow('LOCAL_MEDIA_DIR', { infer: true });
    if (!configured.startsWith('/')) throw new Error('LOCAL_MEDIA_DIR must be an absolute path');
    this.directory = resolve(configured);
    this.maxBytes = config.getOrThrow('LOCAL_MEDIA_MAX_UPLOAD_BYTES', { infer: true });
  }
  async put(input: MediaWrite): Promise<StoredMedia> {
    if (input.content.length === 0 || input.content.length > this.maxBytes) throw new Error('Media payload exceeds allowed size');
    const signature = signatures[input.contentType];
    if (!signature || !matchesSignature(input.content, signature)) throw new Error('Unsupported media type or invalid file signature');
    const id = randomUUID();
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await writeFile(this.pathFor(id), input.content, { mode: 0o600, flag: 'wx' });
    return { id, byteSize: input.content.length, contentType: input.contentType };
  }
  async read(id: string): Promise<Buffer> { return readFile(this.pathFor(id)); }
  private pathFor(id: string): string {
    if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) throw new Error('Invalid media identifier');
    const target = resolve(this.directory, id);
    if (!target.startsWith(`${this.directory}${sep}`)) throw new Error('Invalid media path');
    return target;
  }
}
