import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBooleanString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListNotificationsDto {
  @ApiPropertyOptional({ description: 'Only return unread notifications', example: 'true' })
  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;

  @ApiPropertyOptional({ description: 'Max items (1–100)', example: 50 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}
