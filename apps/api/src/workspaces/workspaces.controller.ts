import {
  Body, ConflictException, Controller, Delete, ForbiddenException, Get, Inject,
  NotFoundException, Param, Patch, Post, Req, UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

const nameSchema = z.object({ name: z.string().trim().min(1).max(100) });
const addSchema = z.object({ email: z.string().email() });
const roleSchema = z.object({ role: z.enum(['OWNER', 'ADMIN', 'MEMBER']) });

@UseGuards(AuthGuard)
@Controller({ path: 'workspaces', version: '1' })
export class WorkspacesController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.prisma.workspace.findMany({
      where: { memberships: { some: { userId: req.authUser!.id } } },
      include: { memberships: { where: { userId: req.authUser!.id }, select: { role: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const { name } = nameSchema.parse(body);
    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({ data: { name, ownerId: req.authUser!.id } });
      await tx.workspaceMembership.create({ data: { workspaceId: workspace.id, userId: req.authUser!.id, role: 'OWNER' } });
      return workspace;
    });
  }

  @Patch(':id')
  async rename(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const membership = await this.actor(id, req.authUser!.id);
    if (!['OWNER', 'ADMIN'].includes(membership.role)) throw new ForbiddenException('Workspace administration required');
    const { name } = nameSchema.parse(body);
    return this.prisma.workspace.update({ where: { id }, data: { name } });
  }

  private async actor(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } });
    if (!member) throw new NotFoundException('Workspace not found');
    return member;
  }

  /** Serializes ownership changes for this workspace, even at READ COMMITTED. */
  private async lockWorkspace(tx: Prisma.TransactionClient, workspaceId: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${workspaceId}))`;
  }

  @Get(':id/members')
  async members(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.actor(id, req.authUser!.id);
    return this.prisma.workspaceMembership.findMany({
      where: { workspaceId: id }, include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  @Post(':id/members')
  async add(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const actor = await this.actor(id, req.authUser!.id);
    if (!['OWNER', 'ADMIN'].includes(actor.role)) throw new ForbiddenException();
    const { email } = addSchema.parse(body);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (await this.prisma.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId: id, userId: user.id } } })) {
      throw new ConflictException('Already a member');
    }
    return this.prisma.workspaceMembership.create({ data: { workspaceId: id, userId: user.id, role: 'MEMBER' } });
  }

  @Patch(':id/members/:userId')
  async role(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Param('userId') userId: string, @Body() body: unknown) {
    const { role } = roleSchema.parse(body);
    return this.prisma.$transaction(async (tx) => {
      await this.lockWorkspace(tx, id);
      const actor = await tx.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId: id, userId: req.authUser!.id } } });
      if (!actor) throw new NotFoundException('Workspace not found');
      if (actor.role !== 'OWNER') throw new ForbiddenException('Owner permission required');
      const target = await tx.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId: id, userId } } });
      if (!target) throw new NotFoundException('Member not found');
      if (target.role === 'OWNER' && role !== 'OWNER' && await tx.workspaceMembership.count({ where: { workspaceId: id, role: 'OWNER' } }) === 1) {
        throw new ConflictException('Final owner cannot be demoted');
      }
      return tx.workspaceMembership.update({ where: { workspaceId_userId: { workspaceId: id, userId } }, data: { role } });
    });
  }

  @Delete(':id/members/:userId')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Param('userId') userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await this.lockWorkspace(tx, id);
      const actor = await tx.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId: id, userId: req.authUser!.id } } });
      if (!actor) throw new NotFoundException('Workspace not found');
      const target = await tx.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId: id, userId } } });
      if (!target) throw new NotFoundException('Member not found');
      if (actor.role === 'MEMBER' || (actor.role === 'ADMIN' && target.role !== 'MEMBER')) throw new ForbiddenException();
      if (target.role === 'OWNER' && await tx.workspaceMembership.count({ where: { workspaceId: id, role: 'OWNER' } }) === 1) {
        throw new ConflictException('Final owner cannot be removed');
      }
      return tx.workspaceMembership.delete({ where: { workspaceId_userId: { workspaceId: id, userId } } });
    });
  }
}
