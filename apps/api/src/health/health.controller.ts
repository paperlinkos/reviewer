import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Controller({ path: 'health', version: '1' })
export class HealthController { constructor(private readonly prisma: PrismaService) {} @Get() async getHealth() { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ok' as const }; } }
