import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Currency, PaymentMethod } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({ description: 'Link to the winning opportunity' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiProperty({ description: 'Deposit in minor units' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  depositMinor: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ description: 'Hold expiry (ISO date)' })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reservationId?: string;

  @ApiProperty({ description: 'Total price in minor units' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalPriceMinor: number;

  @ApiProperty({ description: 'Down payment in minor units' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  downPaymentMinor: number;

  @ApiProperty({ description: 'Number of monthly installments for the remaining balance' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  installmentCount: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ description: 'First installment due date (ISO)' })
  @IsOptional()
  @IsISO8601()
  firstDueDate?: string;
}

export class RecordPaymentDto {
  @ApiProperty({ description: 'Amount in minor units' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountMinor: number;

  @ApiPropertyOptional({ description: 'Target a specific installment' })
  @IsOptional()
  @IsString()
  installmentId?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateCommissionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Commission rate percentage (0–100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ratePct: number;
}

export class QueryContractsDto extends PaginationQueryDto {}
