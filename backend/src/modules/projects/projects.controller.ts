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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateProjectDto, QueryProjectsDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  @RequirePermissions('project:create')
  @ApiOperation({ summary: 'Create a project' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProjectDto) {
    return this.projects.create(user, dto);
  }

  @Get()
  @RequirePermissions('project:read')
  @ApiOperation({ summary: 'List / search projects' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryProjectsDto) {
    return this.projects.findAll(user, query);
  }

  @Get(':id')
  @RequirePermissions('project:read')
  @ApiOperation({ summary: 'Get a project with its units' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.projects.findOne(user, id);
  }

  @Patch(':id')
  @RequirePermissions('project:update')
  @ApiOperation({ summary: 'Update a project' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('project:delete')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.projects.remove(user, id);
  }
}
