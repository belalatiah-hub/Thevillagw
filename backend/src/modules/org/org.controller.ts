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
  CreateDepartmentDto,
  CreatePositionDto,
  CreateTeamDto,
  UpdateDepartmentDto,
  UpdatePositionDto,
  UpdateTeamDto,
} from './dto/org.dto';
import { OrgService } from './org.service';

@ApiTags('org')
@ApiBearerAuth()
@Controller()
export class OrgController {
  constructor(private readonly org: OrgService) {}

  // ── Departments ──
  @Get('departments')
  @RequirePermissions('department:read')
  @ApiOperation({ summary: 'List departments' })
  listDepartments(@CurrentUser() u: AuthUser) {
    return this.org.listDepartments(u.companyId);
  }

  @Post('departments')
  @RequirePermissions('department:create')
  @ApiOperation({ summary: 'Create a department' })
  createDepartment(@CurrentUser() u: AuthUser, @Body() dto: CreateDepartmentDto) {
    return this.org.createDepartment(u.companyId, dto);
  }

  @Patch('departments/:id')
  @RequirePermissions('department:update')
  updateDepartment(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.org.updateDepartment(u.companyId, id, dto);
  }

  @Delete('departments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('department:delete')
  removeDepartment(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.org.removeDepartment(u.companyId, id);
  }

  // ── Positions ──
  @Get('positions')
  @RequirePermissions('position:read')
  @ApiOperation({ summary: 'List positions' })
  listPositions(@CurrentUser() u: AuthUser) {
    return this.org.listPositions(u.companyId);
  }

  @Post('positions')
  @RequirePermissions('position:create')
  createPosition(@CurrentUser() u: AuthUser, @Body() dto: CreatePositionDto) {
    return this.org.createPosition(u.companyId, dto);
  }

  @Patch('positions/:id')
  @RequirePermissions('position:update')
  updatePosition(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.org.updatePosition(u.companyId, id, dto);
  }

  @Delete('positions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('position:delete')
  removePosition(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.org.removePosition(u.companyId, id);
  }

  // ── Teams ──
  @Get('teams')
  @RequirePermissions('team:read')
  @ApiOperation({ summary: 'List teams' })
  listTeams(@CurrentUser() u: AuthUser) {
    return this.org.listTeams(u.companyId);
  }

  @Post('teams')
  @RequirePermissions('team:create')
  createTeam(@CurrentUser() u: AuthUser, @Body() dto: CreateTeamDto) {
    return this.org.createTeam(u.companyId, dto);
  }

  @Patch('teams/:id')
  @RequirePermissions('team:update')
  updateTeam(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.org.updateTeam(u.companyId, id, dto);
  }

  @Delete('teams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('team:delete')
  removeTeam(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.org.removeTeam(u.companyId, id);
  }
}
