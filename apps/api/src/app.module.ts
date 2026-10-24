import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env'; import { HealthController } from './health/health.controller'; import { PrismaService } from './prisma/prisma.service'; import { requestLogger } from './common/request-logger.middleware'; import { StorageModule } from './storage/storage.module'; import { AuthController } from './auth/auth.controller'; import { AuthGuard } from './auth/auth.guard'; import { WorkspacesController } from './workspaces/workspaces.controller';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }), StorageModule], controllers: [HealthController, AuthController, WorkspacesController], providers: [PrismaService, AuthGuard] })
export class AppModule implements NestModule { configure(consumer: MiddlewareConsumer) { consumer.apply(requestLogger).forRoutes('*'); } }
