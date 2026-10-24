import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './auth';
import type { Request } from 'express';
export interface AuthenticatedRequest extends Request { authUser?: { id: string; email: string; name: string }; }
@Injectable()
export class AuthGuard implements CanActivate { async canActivate(context: ExecutionContext): Promise<boolean> { const request = context.switchToHttp().getRequest<AuthenticatedRequest>(); const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) }); if (!session?.user) throw new UnauthorizedException('Authentication required'); request.authUser = { id: session.user.id, email: session.user.email, name: session.user.name }; return true; } }
