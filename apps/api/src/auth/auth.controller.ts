import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from './auth.guard';
@Controller({ path: 'auth', version: '1' })
export class AuthController { @UseGuards(AuthGuard) @Get('session') session(@Req() request: AuthenticatedRequest) { return { user: request.authUser }; } }
