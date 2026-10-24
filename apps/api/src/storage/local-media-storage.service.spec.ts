import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { LocalMediaStorageService } from './local-media-storage.service';
const roots: string[] = [];
function service(directory: string) { return new LocalMediaStorageService(new ConfigService({ LOCAL_MEDIA_DIR: directory, LOCAL_MEDIA_MAX_UPLOAD_BYTES: 100 })); }
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });
describe('LocalMediaStorageService', () => { it('stores and retrieves a signature-validated private file', async () => { const root = await mkdtemp(join(tmpdir(), 'vfp-media-')); roots.push(root); const storage = service(root); const content = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); const stored = await storage.put({ content, contentType: 'image/png' }); await expect(storage.read(stored.id)).resolves.toEqual(content); }); it('rejects path traversal and a mismatched signature', async () => { const root = await mkdtemp(join(tmpdir(), 'vfp-media-')); roots.push(root); const storage = service(root); await expect(storage.read('../secret')).rejects.toThrow('Invalid media identifier'); await expect(storage.put({ content: Buffer.from('not-a-png'), contentType: 'image/png' })).rejects.toThrow('invalid file signature'); }); });
