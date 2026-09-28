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
import { ReceivablesService } from './receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { AdjustReceivableDto } from './dto/adjust-receivable.dto';
import { CancelReceivableDto } from './dto/cancel-receivable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Receivables')
@Controller('receivables')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all receivables with filters' })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('customerId') customerId?: string,
  ) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.receivablesService.findAll(user.businessId, {
      status,
      search,
      customerId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receivable details by ID' })
  async findById(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.receivablesService.findById(user.businessId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create receivable' })
  async create(@CurrentUser() user: any, @Body() dto: CreateReceivableDto) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.receivablesService.create(user.businessId, user.id, dto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a draft/pending receivable' })
  async activate(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.receivablesService.activate(user.businessId, user.id, id);
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: 'Apply credit or debit adjustment' })
  async adjust(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: AdjustReceivableDto,
  ) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.receivablesService.adjust(user.businessId, user.id, id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel receivable with reason' })
  async cancel(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CancelReceivableDto,
  ) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.receivablesService.cancel(user.businessId, user.id, id, dto);
  }
}
