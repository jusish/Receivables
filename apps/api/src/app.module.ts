import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ReceivablesModule } from './modules/receivables/receivables.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BusinessModule } from './modules/business/business.module';
import { AdminModule } from './modules/admin/admin.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        redact: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.passwordHash',
          'req.body.token',
          'req.body.tokenHash',
        ],
        customProps: (req: import('http').IncomingMessage) => ({
          requestId: req.id,
        }),
      },
    }),
    DatabaseModule,
    RedisModule,
    HealthModule,
    AuthModule,
    CustomersModule,
    ReceivablesModule,
    PaymentsModule,
    CollectionsModule,
    DashboardModule,
    ReportsModule,
    BusinessModule,
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
