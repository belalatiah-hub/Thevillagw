import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions('dashboard:read')
  @ApiOperation({ summary: 'Dashboard KPIs + breakdowns (row-scoped to the caller)' })
  dashboard(@CurrentUser() user: AuthUser) {
    return this.reports.dashboard(user);
  }
}
