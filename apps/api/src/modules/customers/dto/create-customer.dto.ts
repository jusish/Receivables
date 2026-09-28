import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Kigali Supermarket Ltd' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '+250788333444' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'CUS-000132', required: false })
  @IsOptional()
  @IsString()
  customerCode?: string;

  @ApiProperty({ example: 'Kigali, Gasabo KG 9 Ave', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 5000000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @ApiProperty({ example: 'VIP corporate client', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
