import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Currency, OpportunityStatus } from '@prisma/client';

export class StageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isWon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLost?: boolean;
}

export class CreatePipelineDto {
  @ApiProperty({ example: 'Primary Sales' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ type: [StageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StageDto)
  stages: StageDto[];
}

export class UpdatePipelineDto extends PartialType(CreatePipelineDto) {}

export class CreateOpportunityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pipelineId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stageId: string;

  @ApiProperty({ example: 'Villa reservation — Ahmed' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Deal value in minor units' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  valueMinor?: number;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsOptional()
  @IsISO8601()
  expectedClose?: string;
}

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @ApiPropertyOptional({ enum: OpportunityStatus })
  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lostReason?: string;
}

export class MoveOpportunityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stageId: string;
}
