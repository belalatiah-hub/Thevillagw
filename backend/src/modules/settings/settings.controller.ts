import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { UpdateSettingsDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Company profile + tenant settings (security, SLA, branding…)' })
  get(@CurrentUser() user: AuthUser) {
    return this.settings.get(user.companyId);
  }

  @Patch()
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update company profile / settings (deep-merged)' })
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateSettingsDto) {
    return this.settings.update(user.companyId, dto);
  }
}
