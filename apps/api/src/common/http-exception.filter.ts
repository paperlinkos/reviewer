import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ZodError } from 'zod';
@Catch()
export class HttpErrorFilter implements ExceptionFilter { catch(exception: unknown, host: ArgumentsHost) { const response = host.switchToHttp().getResponse<Response>(); const status = exception instanceof ZodError ? HttpStatus.BAD_REQUEST : exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR; const detail = exception instanceof ZodError ? 'Invalid request payload' : exception instanceof HttpException ? exception.getResponse() : 'Internal server error'; response.status(status).json({ error: { status, detail, requestId: host.switchToHttp().getRequest<{ id?: string }>().id } }); } }
