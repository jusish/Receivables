import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelReceivableDto {
  @ApiProperty({ example: 'Customer cancelled invoice order before delivery' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
