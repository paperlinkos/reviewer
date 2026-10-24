import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
export function requestLogger(req: Request, res: Response, next: NextFunction) { const started = performance.now(); req.id = randomUUID(); res.on('finish', () => console.info(JSON.stringify({ event: 'http_request', requestId: req.id, method: req.method, path: req.path, status: res.statusCode, durationMs: Math.round(performance.now() - started) }))); next(); }
