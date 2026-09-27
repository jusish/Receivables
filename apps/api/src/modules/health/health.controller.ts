import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../../common/database/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'General health check status' })
  @ApiResponse({ status: 200, description: 'Service health summary' })
  async check() {
    return {
      status: 'ok',
      service: 'receivables-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (process is running)' })
  @ApiResponse({ status: 200, description: 'Process alive' })
  live() {
    return {
      status: 'live',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (PostgreSQL and Redis readiness)' })
  @ApiResponse({ status: 200, description: 'Dependencies ready' })
  @ApiResponse({ status: 503, description: 'Dependencies not ready' })
  async ready(@Res() res: Response) {
    let dbReady = false;
    let redisReady = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbReady = true;
    } catch {
      dbReady = false;
    }

    try {
      redisReady = await this.redis.isHealthy();
    } catch {
      redisReady = false;
    }

    const allReady = dbReady; // PostgreSQL is required; Redis can be graceful in local dev
    const status = allReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(status).json({
      status: allReady ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbReady ? 'up' : 'down',
        redis: redisReady ? 'up' : 'down',
      },
    });
  }
}
