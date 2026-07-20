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
import { IntegrationProvider } from '@prisma/client';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { ConnectIntegrationDto, UpdateIntegrationDto } from './dto/integration.dto';
import { IntegrationsService } from './integrations.service';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  @Get('catalog')
  @RequirePermissions('integration:read')
  @ApiOperation({ summary: 'Available providers + this company’s connection status' })
  catalog(@CurrentUser() user: AuthUser) {
    return this.integrations.catalog(user);
  }

  @Get()
  @RequirePermissions('integration:read')
  @ApiOperation({ summary: 'List connected integrations (secrets never returned)' })
  list(@CurrentUser() user: AuthUser) {
    return this.integrations.list(user);
  }

  @Post(':provider/connect')
  @RequirePermissions('integration:update')
  @ApiOperation({ summary: 'Connect / reconnect a provider (secrets encrypted at rest)' })
  connect(
    @CurrentUser() user: AuthUser,
    @Param('provider') provider: IntegrationProvider,
    @Body() dto: ConnectIntegrationDto,
  ) {
    return this.integrations.connect(user, provider, dto);
  }

  @Patch(':id')
  @RequirePermissions('integration:update')
  @ApiOperation({ summary: 'Enable/disable or update an integration' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrations.update(user, id, dto);
  }

  @Post(':id/test')
  @RequirePermissions('integration:update')
  @ApiOperation({ summary: 'Run a connection/health test and record a sync log' })
  test(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.integrations.test(user, id);
  }

  @Get(':id/logs')
  @RequirePermissions('integration:read')
  @ApiOperation({ summary: 'Recent sync/health logs for an integration' })
  logs(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.integrations.logs(user, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('integration:delete')
  @ApiOperation({ summary: 'Disconnect an integration' })
  disconnect(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.integrations.disconnect(user, id);
  }
}
