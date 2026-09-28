import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminRole, BusinessStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin Console')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Platform aggregate operational metrics' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('businesses')
  @ApiOperation({ summary: 'List all tenant businesses' })
  async getBusinesses(@Query('search') search?: string) {
    return this.adminService.getBusinesses(search);
  }

  @Post('businesses')
  @ApiOperation({ summary: 'Register a new tenant business' })
  async createBusiness(
    @Body()
    body: {
      name: string;
      code: string;
      currency?: string;
      timezone?: string;
      ownerFullName?: string;
      ownerPhone?: string;
    },
    @CurrentUser() adminUser: any,
  ) {
    return this.adminService.createBusiness(body, adminUser?.id);
  }

  @Post('businesses/:id/assign-owner')
  @ApiOperation({ summary: 'Assign or create an owner user for a business' })
  async assignBusinessOwner(
    @Param('id') id: string,
    @Body() body: { fullName?: string; phone: string; password?: string },
    @CurrentUser() adminUser: any,
  ) {
    return this.adminService.assignBusinessOwner(id, body, adminUser?.id || 'SYSTEM');
  }

  @Put('businesses/:id/status')
  @ApiOperation({ summary: 'Update business status (ACTIVE/SUSPENDED)' })
  async updateBusinessStatus(
    @Param('id') id: string,
    @Body('status') status: BusinessStatus,
  ) {
    return this.adminService.updateBusinessStatus(id, status);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all platform users' })
  async getUsers(@Query('search') search?: string) {
    return this.adminService.getUsers(search);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user with optional admin role' })
  async createUser(
    @Body()
    body: {
      fullName: string;
      phone: string;
      password?: string;
      adminRole?: AdminRole;
    },
  ) {
    return this.adminService.createUser(body);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user admin privileges or active status' })
  async updateUser(
    @Param('id') id: string,
    @Body()
    body: {
      fullName?: string;
      adminRole?: AdminRole | null;
      isActive?: boolean;
    },
  ) {
    return this.adminService.updateUser(id, body);
  }

  @Get('requests')
  @ApiOperation({ summary: 'API request logs explorer' })
  async getApiRequests(@Query('search') search?: string) {
    return this.adminService.getApiRequests(search);
  }

  @Get('errors')
  @ApiOperation({ summary: 'System error explorer (4xx and 5xx logs)' })
  async getErrors() {
    return this.adminService.getErrors();
  }

  @Get('health')
  @ApiOperation({ summary: 'Detailed system infrastructure health' })
  async getHealth() {
    return this.adminService.getHealth();
  }

  @Get('audit')
  @ApiOperation({ summary: 'Platform-wide audit trail' })
  async getAuditTrail(@Query('search') search?: string) {
    return this.adminService.getAuditTrail(search);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Platform runtime and security configurations' })
  async getSettings() {
    return this.adminService.getSettings();
  }
}
