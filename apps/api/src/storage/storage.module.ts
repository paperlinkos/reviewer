import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env';
import { LocalMediaStorageService } from './local-media-storage.service';
import { MEDIA_STORAGE } from './media-storage';
@Module({ providers: [LocalMediaStorageService, { provide: MEDIA_STORAGE, inject: [ConfigService, LocalMediaStorageService], useFactory: (config: ConfigService<Env, true>, local: LocalMediaStorageService) => { if (config.getOrThrow('STORAGE_PROVIDER', { infer: true }) !== 'local') throw new Error('S3 storage adapter is not implemented in Phase 00'); return local; } }], exports: [MEDIA_STORAGE] })
export class StorageModule {}
