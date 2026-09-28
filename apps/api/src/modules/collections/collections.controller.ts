import { Controller, Get, Post, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollectionsService } from './collections.service';
import { CreateCollectionActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Collections')
@Controller('collections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get collection activities and follow-up metrics' })
  async findAll(@CurrentUser() user: any) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.collectionsService.findAll(user.businessId);
  }

  @Post()
  @ApiOperation({ summary: 'Log collection communication activity' })
  async create(@CurrentUser() user: any, @Body() dto: CreateCollectionActivityDto) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.collectionsService.create(user.businessId, user.id, dto);
  }

  @Post('tasks/:taskId/complete')
  @ApiOperation({ summary: 'Mark follow-up task as completed' })
  async completeTask(@CurrentUser() user: any, @Param('taskId') taskId: string) {
    if (!user.businessId) {
      throw new ForbiddenException('No active business associated with this session');
    }
    return this.collectionsService.completeTask(user.businessId, taskId);
  }
}
