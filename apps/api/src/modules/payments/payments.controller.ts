import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments for active business' })
  async findAll(@CurrentUser() user: any, @Query('search') search?: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.paymentsService.findAll(user.businessId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details by ID' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.paymentsService.findById(user.businessId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Record payment and allocate to receivables' })
  async create(@CurrentUser() user: any, @Body() dto: CreatePaymentDto) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.paymentsService.create(user.businessId, user.id, dto);
  }
}
