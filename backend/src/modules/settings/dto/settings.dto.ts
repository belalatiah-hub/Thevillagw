import { ApiPropertyOptional } from '@nestjs/swagger';
import { Currency } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  baseCurrency?: Currency;

  @ApiPropertyOptional({ example: 'Africa/Cairo' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Partial settings object; deep-merged over the stored settings',
    example: { security: { require2FA: true }, sla: { firstResponseMins: 10 } },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
