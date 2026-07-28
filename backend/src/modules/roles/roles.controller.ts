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
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get('catalog')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Full permission catalogue (grouped) for the visual dashboard' })
  catalog() {
    return this.roles.catalog();
  }

  @Get('test-report')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Automated Permission Test Report (PASS/WARNING/FAILED per role)' })
  testReport(@CurrentUser() user: AuthUser) {
    return this.roles.testReport(user.companyId);
  }

  @Get()
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'List roles with member counts' })
  list(@CurrentUser() user: AuthUser) {
    return this.roles.list(user.companyId);
  }

  @Get(':id')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'Get a role' })
  getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roles.getOne(user.companyId, id);
  }

  @Post()
  @RequirePermissions('role:create')
  @ApiOperation({ summary: 'Create a custom role' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRoleDto) {
    return this.roles.create(user.companyId, dto, user);
  }

  @Patch(':id')
  @RequirePermissions('role:update')
  @ApiOperation({ summary: 'Update a role name / permission set' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roles.update(user.companyId, id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('role:delete')
  @ApiOperation({ summary: 'Delete a custom role (system roles are protected)' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roles.remove(user.companyId, id);
  }
}
