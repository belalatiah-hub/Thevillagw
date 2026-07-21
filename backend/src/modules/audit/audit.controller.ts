import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/audit.dto';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @RequirePermissions('audit:read')
  @ApiOperation({ summary: 'Query the audit trail (filter by actor, action, entity, date range)' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryAuditDto) {
    return this.audit.list(user.companyId, query);
  }

  @Get('export')
  @RequirePermissions('audit:export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="audit-log.csv"')
  @ApiOperation({ summary: 'Export the matching audit trail as CSV' })
  async export(@CurrentUser() user: AuthUser, @Query() query: QueryAuditDto, @Res() res: Response) {
    const csv = await this.audit.exportCsv(user.companyId, query);
    res.send(csv);
  }
}
