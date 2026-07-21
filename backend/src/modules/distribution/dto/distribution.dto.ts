import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DistributionStrategy } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateDistributionRuleDto {
  @ApiProperty({ example: 'Hot Facebook → New Cairo team' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ example: { source: ['FACEBOOK'], area: ['New Cairo'], minScore: 70 } })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: DistributionStrategy })
  @IsOptional()
  @IsEnum(DistributionStrategy)
  strategy?: DistributionStrategy;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetTeamId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiPropertyOptional({
    description: 'Max leads per agent per day (null = uncapped)',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  dailyCapPerAgent?: number;
}

export class UpdateDistributionRuleDto extends CreateDistributionRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  declare name: string;
}
