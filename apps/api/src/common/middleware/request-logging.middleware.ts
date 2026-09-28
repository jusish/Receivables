import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    res.on('finish', async () => {
      try {
        const latencyMs = Math.max(1, Date.now() - startTime);
        const reqAny = req as any;
        const requestId =
          reqAny.id ||
          (req.headers['x-request-id'] as string) ||
          `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const user = reqAny.user;
        const businessId = user?.businessId || (req.headers['x-business-id'] as string) || null;
        const userId = user?.sub || user?.id || null;

        const rawIp =
          (req.headers['x-forwarded-for'] as string) ||
          req.socket.remoteAddress ||
          req.ip ||
          '127.0.0.1';
        const ipAddress = rawIp.split(',')[0].trim();
        const userAgent = (req.headers['user-agent'] as string) || null;

        const route = req.originalUrl || req.url;
        const statusCode = res.statusCode;

        // Skip logging health checks from hammering the database if desired, or log everything
        await this.prisma.apiRequestLog.create({
          data: {
            requestId,
            httpMethod: req.method,
            route,
            businessId,
            userId,
            ipAddress,
            userAgent,
            statusCode,
            latencyMs,
            errorMetadata:
              statusCode >= 400
                ? {
                    status: statusCode,
                    message: res.statusMessage || `HTTP ${statusCode}`,
                  }
                : undefined,
          },
        });
      } catch (err: any) {
        // Do not crash if log creation fails
        this.logger.debug(`Failed to persist request log: ${err.message}`);
      }
    });

    next();
  }
}
