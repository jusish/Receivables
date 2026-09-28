import { IsString, IsNotEmpty, IsNumber, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustReceivableDto {
  @ApiProperty({ example: 'CREDIT', enum: ['CREDIT', 'DEBIT'] })
  @IsString()
  @IsIn(['CREDIT', 'DEBIT'])
  type!: 'CREDIT' | 'DEBIT';

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: 'Returned damaged goods' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
