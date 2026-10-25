import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const reviewCookieName = 'vfp_review_session';

@Injectable()
export class ReviewSessionService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async redeem(invitationToken: string) {
    const invitation = await this.prisma.projectInvitation.findUnique({ where: { tokenHash: digest(invitationToken) }, include: { project: true } });
    if (!invitation || invitation.revokedAt || invitation.expiresAt <= new Date() || invitation.project.status !== 'ACTIVE') throw new NotFoundException('Review link is invalid or expired');
    const token = randomBytes(32).toString('base64url');
    const session = await this.prisma.clientReviewSession.create({ data: { invitationId: invitation.id, tokenHash: digest(token), expiresAt: invitation.expiresAt } });
    return { token, expiresAt: session.expiresAt, project: invitation.project };
  }
  async validate(token: string, projectId?: string) {
    const session = await this.prisma.clientReviewSession.findUnique({ where: { tokenHash: digest(token) }, include: { invitation: { include: { project: true } } } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.invitation.revokedAt || session.invitation.expiresAt <= new Date() || session.invitation.project.status !== 'ACTIVE' || (projectId && session.invitation.projectId !== projectId)) throw new NotFoundException('Review session is invalid or expired');
    return session;
  }
}
