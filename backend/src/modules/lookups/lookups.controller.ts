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
import { CreateLookupDto, QueryLookupsDto, UpdateLookupDto } from './dto/lookup.dto';
import { LookupsService } from './lookups.service';

@ApiTags('lookups')
@ApiBearerAuth()
@Controller('lookups')
export class LookupsController {
  constructor(private readonly lookups: LookupsService) {}

  @Get()
  @ApiOperation({ summary: 'List lookups (optionally by type) — any authenticated user' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryLookupsDto) {
    return this.lookups.list(user.companyId, query.type);
  }

  @Post()
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Add a lookup value' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLookupDto) {
    return this.lookups.create(user.companyId, dto);
  }

  @Post('seed-defaults')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Seed the default lookup sets' })
  seed(@CurrentUser() user: AuthUser) {
    return this.lookups.seedDefaults(user.companyId);
  }

  @Patch(':id')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update a lookup value' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateLookupDto) {
    return this.lookups.update(user.companyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Delete a lookup value' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.lookups.remove(user.companyId, id);
  }
}
