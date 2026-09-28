import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Business Settings')
@Controller('business')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @ApiOperation({ summary: 'Get business profile and members' })
  async getProfile(@CurrentUser() user: any) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.businessService.getProfile(user.businessId);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Get audit trail events for current workspace' })
  async getAuditTrail(@CurrentUser() user: any, @Query('search') search?: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.businessService.getAuditTrail(user.businessId, search);
  }

  @Put()
  @ApiOperation({ summary: 'Update business settings' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body()
    body: {
      name?: string;
      timezone?: string;
      settings?: {
        collectionsEnabled?: boolean;
        agingSchedule?: string;
        customAgingDays?: number[];
      };
    },
  ) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.businessService.updateProfile(user.businessId, body);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new business workspace as owner' })
  async createBusiness(
    @CurrentUser() user: any,
    @Body()
    body: {
      name: string;
      code?: string;
      currency?: string;
      timezone?: string;
      agingSchedule?: string;
    },
  ) {
    return this.businessService.createBusinessForUser(user.id, body);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite new staff member to business' })
  async inviteMember(
    @CurrentUser() user: any,
    @Body() body: { phone: string; role: string; fullName?: string },
  ) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.businessService.inviteMember(user.businessId, user.id, body);
  }
}

