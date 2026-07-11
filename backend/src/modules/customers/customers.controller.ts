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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, QueryCustomersDto, UpdateCustomerDto } from './dto/customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post()
  @RequirePermissions('customer:create')
  @ApiOperation({ summary: 'Create a customer' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCustomerDto) {
    return this.customers.create(user, dto);
  }

  @Get()
  @RequirePermissions('customer:read')
  @ApiOperation({ summary: 'List / search customers' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryCustomersDto) {
    return this.customers.findAll(user, query);
  }

  @Get(':id')
  @RequirePermissions('customer:read')
  @ApiOperation({ summary: 'Get a customer with activity + opportunities' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.customers.findOne(user, id);
  }

  @Patch(':id')
  @RequirePermissions('customer:update')
  @ApiOperation({ summary: 'Update a customer' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customers.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('customer:delete')
  @ApiOperation({ summary: 'Delete a customer' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.customers.remove(user, id);
  }
}
