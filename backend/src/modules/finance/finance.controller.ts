import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateCommissionDto,
  CreateContractDto,
  CreateReservationDto,
  QueryContractsDto,
  RecordPaymentDto,
} from './dto/finance.dto';
import { FinanceService } from './finance.service';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Post('reservations')
  @RequirePermissions('opportunity:update')
  @ApiOperation({ summary: 'Hold a unit for a customer (marks it RESERVED)' })
  reserve(@CurrentUser() user: AuthUser, @Body() dto: CreateReservationDto) {
    return this.finance.createReservation(user, dto);
  }

  @Post('contracts')
  @RequirePermissions('opportunity:update')
  @ApiOperation({ summary: 'Create a contract + installment schedule (marks unit SOLD)' })
  createContract(@CurrentUser() user: AuthUser, @Body() dto: CreateContractDto) {
    return this.finance.createContract(user, dto);
  }

  @Get('contracts')
  @RequirePermissions('report:read')
  @ApiOperation({ summary: 'List contracts' })
  listContracts(@CurrentUser() user: AuthUser, @Query() query: QueryContractsDto) {
    return this.finance.listContracts(user, query);
  }

  @Get('contracts/:id')
  @RequirePermissions('report:read')
  @ApiOperation({ summary: 'Get a contract with installments, payments and commissions' })
  getContract(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.finance.getContract(user, id);
  }

  @Post('contracts/:id/payments')
  @RequirePermissions('opportunity:update')
  @ApiOperation({ summary: 'Record a payment against a contract / installment' })
  pay(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.finance.recordPayment(user, id, dto);
  }

  @Post('contracts/:id/commissions')
  @RequirePermissions('opportunity:update')
  @ApiOperation({ summary: 'Book a commission for a team member on a contract' })
  commission(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateCommissionDto,
  ) {
    return this.finance.createCommission(user, id, dto);
  }
}
