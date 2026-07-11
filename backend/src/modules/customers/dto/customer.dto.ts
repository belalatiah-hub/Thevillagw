import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Currency } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateCustomerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  passportNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredArea?: string;

  @ApiPropertyOptional({ description: 'Budget floor in minor units' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  budgetMinMinor?: number;

  @ApiPropertyOptional({ description: 'Budget ceiling in minor units' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  budgetMaxMinor?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bedroomsWanted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  investmentGoal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timeline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class QueryCustomersDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;
}
