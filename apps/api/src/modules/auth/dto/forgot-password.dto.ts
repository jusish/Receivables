import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: '+250788123456' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}
