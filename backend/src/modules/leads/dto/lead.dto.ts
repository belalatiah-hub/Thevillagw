import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Currency, LeadSource, LeadStatus, LeadTemperature } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateLeadDto {
  @ApiProperty({ example: 'Omar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  firstName: string;

  @ApiPropertyOptional({ example: 'Fahmy' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({ example: 'omar@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+20 100 000 0000' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ enum: LeadSource, default: LeadSource.MANUAL })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ example: 'New Cairo' })
  @IsOptional()
  @IsString()
  interestArea?: string;

  @ApiPropertyOptional({ description: 'Budget in minor units (piastres/cents)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  budgetMinor?: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.EGP })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  // Marketing attribution
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  landingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referrerUrl?: string;
}

/** Payload the public marketing site posts to the capture endpoint. */
export class CaptureLeadDto extends CreateLeadDto {
  @ApiProperty({ description: 'Company slug the lead belongs to', example: 'the-village' })
  @IsString()
  @IsNotEmpty()
  companySlug: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadTemperature })
  @IsOptional()
  @IsEnum(LeadTemperature)
  temperature?: LeadTemperature;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lostReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wonReason?: string;
}

export class AssignLeadDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ownerId: string;
}

export class QueryLeadsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional({ enum: LeadTemperature })
  @IsOptional()
  @IsEnum(LeadTemperature)
  temperature?: LeadTemperature;

  @ApiPropertyOptional({ description: 'Filter to a specific owner' })
  @IsOptional()
  @IsString()
  ownerId?: string;
}
