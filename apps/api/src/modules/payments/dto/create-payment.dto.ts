import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentAllocationItemDto {
  @ApiProperty({ example: 'rec_123' })
  @IsString()
  @IsNotEmpty()
  receivableId!: string;

  @ApiProperty({ example: 350000 })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class CreatePaymentDto {
  @ApiProperty({ example: 'cus_123' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ example: '2026-09-28', required: false })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiProperty({ example: 'MOBILE_MONEY', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHEQUE', 'OTHER'])
  paymentMethod?: string;

  @ApiProperty({ example: 'MOMO-991203', required: false })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ example: 'Full settlement of invoice', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'rec_123', required: false })
  @IsOptional()
  @IsString()
  targetReceivableId?: string;

  @ApiProperty({ type: [PaymentAllocationItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationItemDto)
  allocations?: PaymentAllocationItemDto[];
}
