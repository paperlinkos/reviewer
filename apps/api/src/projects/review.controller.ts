import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { ReviewSessionService, reviewCookieName } from './review-session.service';

const cookie = (request: Request) => request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${reviewCookieName}=`))?.slice(reviewCookieName.length + 1);
@Controller({ path: 'review', version: '1' })
export class ReviewController {
  constructor(@Inject(ReviewSessionService) private readonly sessions: ReviewSessionService) {}
  @Post('redeem') async redeem(@Body() body: unknown, @Res({ passthrough: true }) response: Response) { const result = await this.sessions.redeem(z.object({ token: z.string().min(20) }).parse(body).token); response.cookie(reviewCookieName, result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', expires: result.expiresAt, path: '/api/v1/review' }); return { project: { id: result.project.id, name: result.project.name, websiteUrl: result.project.websiteUrl } }; }
  @Get('session') async session(@Req() request: Request) { const token = cookie(request); if (!token) return this.sessions.validate(''); const session = await this.sessions.validate(token); return { project: { id: session.invitation.project.id, name: session.invitation.project.name, websiteUrl: session.invitation.project.websiteUrl } }; }
}
