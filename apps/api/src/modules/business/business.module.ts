import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'super_secret_jwt_key_replace_in_production_min_32_characters',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
      },
    }),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
