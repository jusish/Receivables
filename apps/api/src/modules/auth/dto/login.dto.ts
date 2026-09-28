import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+250788123456' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'web', required: false })
  @IsOptional()
  @IsIn(['web', 'admin'])
  portalType?: 'web' | 'admin';

  @ApiProperty({ example: '307ab063-9d5a-4402-8b1f-0772964f5a35', required: false })
  @IsOptional()
  @IsString()
  lastBusinessId?: string;
}
