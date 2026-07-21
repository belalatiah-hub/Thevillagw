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
import { CreateDistributionRuleDto, UpdateDistributionRuleDto } from './dto/distribution.dto';
import { DistributionService } from './distribution.service';

@ApiTags('distribution')
@ApiBearerAuth()
@Controller('distribution')
export class DistributionController {
  constructor(private readonly distribution: DistributionService) {}

  @Get('rules')
  @RequirePermissions('distribution:read')
  @ApiOperation({ summary: 'List lead-distribution rules' })
  list(@CurrentUser() user: AuthUser) {
    return this.distribution.list(user.companyId);
  }

  @Post('rules')
  @RequirePermissions('distribution:create')
  @ApiOperation({ summary: 'Create a distribution rule' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDistributionRuleDto) {
    return this.distribution.create(user.companyId, dto);
  }

  @Patch('rules/:id')
  @RequirePermissions('distribution:update')
  @ApiOperation({ summary: 'Update / enable / disable a rule' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateDistributionRuleDto,
  ) {
    return this.distribution.update(user.companyId, id, dto);
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('distribution:delete')
  @ApiOperation({ summary: 'Delete a rule' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.distribution.remove(user.companyId, id);
  }

  @Post('preview/:leadId')
  @RequirePermissions('distribution:read')
  @ApiOperation({ summary: 'Dry-run: which rule fires and who gets the lead' })
  preview(@CurrentUser() user: AuthUser, @Param('leadId') leadId: string) {
    return this.distribution.preview(user.companyId, leadId);
  }
}
