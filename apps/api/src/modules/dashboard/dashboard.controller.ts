import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get business accounts receivable KPI metrics and aging breakdown' })
  async getMetrics(@CurrentUser() user: any) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.dashboardService.getMetrics(user.businessId);
  }
}
