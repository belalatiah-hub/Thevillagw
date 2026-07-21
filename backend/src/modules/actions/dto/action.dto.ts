import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateActionDto {
  @ApiProperty({ example: 'Call', description: 'The planned next action' })
  @IsString()
  @IsNotEmpty()
  nextAction: string;

  @ApiPropertyOptional({ description: 'Resulting lead stage/status name' })
  @IsOptional()
  @IsString()
  stageName?: string;

  @ApiPropertyOptional({
    description: 'Quick due preset',
    enum: ['after_1h', 'after_2h', 'tomorrow', 'next_week'],
  })
  @IsOptional()
  @IsIn(['after_1h', 'after_2h', 'tomorrow', 'next_week'])
  due?: string;

  @ApiPropertyOptional({ description: 'Explicit due date (overrides `due`)' })
  @IsOptional()
  @IsISO8601()
  dueAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Voice-note recording URL' })
  @IsOptional()
  @IsString()
  voiceNoteUrl?: string;

  @ApiPropertyOptional({ description: 'Lead qualification 1–5 stars', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agentId?: string;
}
