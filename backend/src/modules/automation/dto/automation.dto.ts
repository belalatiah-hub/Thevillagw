import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AutomationTrigger } from '@prisma/client';

export class ActionDto {
  @ApiProperty({
    enum: [
      'ASSIGN_ROUND_ROBIN',
      'ASSIGN_USER',
      'CREATE_FOLLOW_UP',
      'START_SLA',
      'SEND_WHATSAPP_TEMPLATE',
      'GENERATE_AI_SUMMARY',
      'NOTIFY_OWNER',
    ],
  })
  @IsString()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  template?: string;
}

export class CreateAutomationRuleDto {
  @ApiProperty({ example: 'Inbound web leads' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: AutomationTrigger })
  @IsOptional()
  @IsEnum(AutomationTrigger)
  trigger?: AutomationTrigger;

  @ApiPropertyOptional({ description: '{ source?, temperature?, minScore?, area? }', type: Object })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiProperty({ type: [ActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions: ActionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class UpdateAutomationRuleDto extends PartialType(CreateAutomationRuleDto) {}
