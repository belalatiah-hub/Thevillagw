import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency, UnitStatus, UnitType } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateUnitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'B-1204' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType)
  type: UnitType;

  @ApiPropertyOptional({ enum: UnitStatus })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiProperty({ description: 'Price in minor units (piastres/cents)', example: 950000000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMinor: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bathrooms?: number;

  @ApiPropertyOptional({ description: 'Built-up area in m²' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  builtUpArea?: number;

  @ApiPropertyOptional({ description: 'Land/garden area in m²' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  landArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  floor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phase?: string;

  @ApiPropertyOptional({ description: 'Down payment percentage (0–100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  downPaymentPct?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  installmentYears?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}

export class QueryUnitsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: UnitStatus })
  @IsOptional()
  @IsEnum(UnitStatus)
  status?: UnitStatus;

  @ApiPropertyOptional({ enum: UnitType })
  @IsOptional()
  @IsEnum(UnitType)
  type?: UnitType;

  @ApiPropertyOptional({ description: 'Minimum bedrooms' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minBedrooms?: number;

  @ApiPropertyOptional({ description: 'Max price in minor units' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPriceMinor?: number;
}
