import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '+250788123456' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp!: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}
