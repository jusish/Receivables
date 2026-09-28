import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCollectionActivityDto {
  @ApiProperty({ example: 'cus_123' })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({ example: 'rec_123', required: false })
  @IsOptional()
  @IsString()
  receivableId?: string;

  @ApiProperty({ example: 'PHONE_CALL', required: false })
  @IsOptional()
  @IsString()
  @IsIn([
    'PHONE_CALL',
    'IN_PERSON',
    'SMS',
    'WHATSAPP',
    'EMAIL',
    'LETTER',
    'OTHER',
  ])
  type?: string;

  @ApiProperty({ example: 'PROMISED_TO_PAY' })
  @IsString()
  @IsIn([
    'NO_ANSWER',
    'PROMISED_TO_PAY',
    'PAYMENT_MADE',
    'DISPUTED',
    'WRONG_NUMBER',
    'CUSTOMER_UNAVAILABLE',
    'REFUSED',
    'FOLLOW_UP_LATER',
    'OTHER',
  ])
  outcome!: string;

  @ApiProperty({ example: 'Spoke with accounts clerk, transfer scheduled for Friday' })
  @IsString()
  @IsNotEmpty()
  notes!: string;

  @ApiProperty({ example: '2026-10-05', required: false })
  @IsOptional()
  @IsDateString()
  promisedDate?: string;

  @ApiProperty({ example: 400000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  promisedAmount?: number;
}
