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
import { CreateUnitDto, QueryUnitsDto, UpdateUnitDto } from './dto/unit.dto';
import { UnitsService } from './units.service';

@ApiTags('units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private readonly units: UnitsService) {}

  @Post()
  @RequirePermissions('unit:create')
  @ApiOperation({ summary: 'Create a unit' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUnitDto) {
    return this.units.create(user, dto);
  }

  @Get()
  @RequirePermissions('unit:read')
  @ApiOperation({ summary: 'Search inventory (filter by project, status, type, beds, price)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryUnitsDto) {
    return this.units.findAll(user, query);
  }

  @Get(':id')
  @RequirePermissions('unit:read')
  @ApiOperation({ summary: 'Get a unit' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.units.findOne(user, id);
  }

  @Patch(':id')
  @RequirePermissions('unit:update')
  @ApiOperation({ summary: 'Update a unit (e.g. mark RESERVED / SOLD)' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.units.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('unit:delete')
  @ApiOperation({ summary: 'Delete a unit' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.units.remove(user, id);
  }
}
