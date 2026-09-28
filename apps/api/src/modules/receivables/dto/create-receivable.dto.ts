import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReceivableItemDto {
  @ApiProperty({ example: 'Cement Grade 42.5 (50kg)' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;
}

export class CreateReceivableDto {
  @ApiProperty({ example: 'cus_123' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 'REC-000189', required: false })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0.01)
  originalAmount!: number;

  @ApiProperty({ example: '2026-10-30', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: 'DELIVERY', required: false })
  @IsOptional()
  @IsString()
  @IsIn([
    'MANUAL',
    'DELIVERY',
    'INVOICE',
    'SALES_ORDER',
    'IMPORT',
    'API',
    'INTEGRATION',
    'OTHER',
  ])
  sourceType?: string;

  @ApiProperty({ example: 'DEL-2026-112', required: false })
  @IsOptional()
  @IsString()
  sourceReference?: string;

  @ApiProperty({ example: 'ACTIVE', required: false })
  @IsOptional()
  @IsIn(['DRAFT', 'PENDING_ACTIVATION', 'ACTIVE'])
  status?: 'DRAFT' | 'PENDING_ACTIVATION' | 'ACTIVE';

  @ApiProperty({ type: [ReceivableItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivableItemDto)
  items?: ReceivableItemDto[];
}
