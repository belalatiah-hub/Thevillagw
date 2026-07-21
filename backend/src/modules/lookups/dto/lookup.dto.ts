import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LookupType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class QueryLookupsDto {
  @ApiPropertyOptional({ enum: LookupType })
  @IsOptional()
  @IsEnum(LookupType)
  type?: LookupType;
}

export class CreateLookupDto {
  @ApiProperty({ enum: LookupType })
  @IsEnum(LookupType)
  type: LookupType;

  @ApiProperty({ example: 'Property Finder' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ example: '#e0603a' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: { kind: 'WON' } })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class UpdateLookupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}
