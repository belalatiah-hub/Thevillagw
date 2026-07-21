import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartConversationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  leadId: string;

  @ApiPropertyOptional({ description: 'Override number if the lead has none' })
  @IsOptional()
  @IsString()
  waNumber?: string;
}

export class SendWaMessageDto {
  @ApiPropertyOptional({ description: 'Free-text message body' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: 'Template name to send instead of free text' })
  @IsOptional()
  @IsString()
  templateName?: string;
}
