import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateOpportunityDto,
  CreatePipelineDto,
  MoveOpportunityDto,
  UpdateOpportunityDto,
  UpdatePipelineDto,
} from './dto/pipeline.dto';
import { PipelineService } from './pipeline.service';

@ApiTags('pipeline')
@ApiBearerAuth()
@Controller()
export class PipelineController {
  constructor(private readonly pipeline: PipelineService) {}

  // Pipelines & stages
  @Post('pipelines')
  @RequirePermissions('pipeline:create')
  @ApiOperation({ summary: 'Create a pipeline with its stages' })
  createPipeline(@CurrentUser() user: AuthUser, @Body() dto: CreatePipelineDto) {
    return this.pipeline.createPipeline(user, dto);
  }

  @Get('pipelines')
  @RequirePermissions('pipeline:read')
  @ApiOperation({ summary: 'List pipelines' })
  listPipelines(@CurrentUser() user: AuthUser) {
    return this.pipeline.listPipelines(user);
  }

  @Get('pipelines/:id')
  @RequirePermissions('pipeline:read')
  @ApiOperation({ summary: 'Get a pipeline as a board (stages with open opportunities)' })
  getPipeline(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.pipeline.getPipeline(user, id);
  }

  @Get('pipelines/:id/forecast')
  @RequirePermissions('report:read')
  @ApiOperation({ summary: 'Weighted revenue forecast for a pipeline' })
  forecast(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.pipeline.forecast(user, id);
  }

  @Patch('pipelines/:id')
  @RequirePermissions('pipeline:update')
  @ApiOperation({ summary: 'Update a pipeline' })
  updatePipeline(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipeline.updatePipeline(user, id, dto);
  }

  // Opportunities
  @Post('opportunities')
  @RequirePermissions('opportunity:create')
  @ApiOperation({ summary: 'Create an opportunity (deal)' })
  createOpportunity(@CurrentUser() user: AuthUser, @Body() dto: CreateOpportunityDto) {
    return this.pipeline.createOpportunity(user, dto);
  }

  @Patch('opportunities/:id/move')
  @RequirePermissions('opportunity:update')
  @ApiOperation({ summary: 'Move an opportunity to another stage (drag & drop)' })
  moveOpportunity(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: MoveOpportunityDto,
  ) {
    return this.pipeline.moveOpportunity(user, id, dto);
  }

  @Patch('opportunities/:id')
  @RequirePermissions('opportunity:update')
  @ApiOperation({ summary: 'Update an opportunity' })
  updateOpportunity(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.pipeline.updateOpportunity(user, id, dto);
  }

  @Delete('opportunities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('opportunity:delete')
  @ApiOperation({ summary: 'Delete an opportunity' })
  removeOpportunity(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.pipeline.removeOpportunity(user, id);
  }
}
