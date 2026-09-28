import { Controller, Get, Post, Query, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('ar-aging')
  @ApiOperation({ summary: 'A/R aging bracket report' })
  async getAgingReport(@CurrentUser() user: any) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.reportsService.getAgingReport(user.businessId);
  }

  @Get('customer-statements')
  @ApiOperation({ summary: 'Customer balances and statement summary' })
  async getCustomerStatements(@CurrentUser() user: any) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.reportsService.getCustomerStatements(user.businessId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Payments breakdown report' })
  async getPaymentsReport(@CurrentUser() user: any) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.reportsService.getPaymentsReport(user.businessId);
  }

  @Post('export-pdf')
  @ApiOperation({ summary: 'Trigger PDF report compilation' })
  async exportPdf(@CurrentUser() user: any, @Body('reportType') reportType?: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.reportsService.generatePdfExport(user.businessId, reportType || 'ar_aging');
  }
}
