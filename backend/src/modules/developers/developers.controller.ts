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
import { DevelopersService } from './developers.service';
import { CreateDeveloperDto, QueryDevelopersDto, UpdateDeveloperDto } from './dto/developer.dto';

@ApiTags('developers')
@ApiBearerAuth()
@Controller('developers')
export class DevelopersController {
  constructor(private readonly developers: DevelopersService) {}

  @Post()
  @RequirePermissions('developer:create')
  @ApiOperation({ summary: 'Create a developer' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDeveloperDto) {
    return this.developers.create(user, dto);
  }

  @Get()
  @RequirePermissions('developer:read')
  @ApiOperation({ summary: 'List developers' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryDevelopersDto) {
    return this.developers.findAll(user, query);
  }

  @Get(':id')
  @RequirePermissions('developer:read')
  @ApiOperation({ summary: 'Get a developer with its projects' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.developers.findOne(user, id);
  }

  @Patch(':id')
  @RequirePermissions('developer:update')
  @ApiOperation({ summary: 'Update a developer' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateDeveloperDto) {
    return this.developers.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('developer:delete')
  @ApiOperation({ summary: 'Delete a developer' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.developers.remove(user, id);
  }
}
