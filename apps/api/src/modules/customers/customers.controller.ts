import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers for the active business' })
  async findAll(@CurrentUser() user: any, @Query('search') search?: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.customersService.findAll(user.businessId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID with transaction history' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.customersService.findById(user.businessId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new customer' })
  async create(@CurrentUser() user: any, @Body() dto: CreateCustomerDto) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.customersService.create(user.businessId, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update customer details' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateCustomerDto>,
  ) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.customersService.update(user.businessId, id, user.id, dto);
  }
}
