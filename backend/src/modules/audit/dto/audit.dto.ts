import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class QueryAuditDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by actor (user id)' })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({ description: 'Substring match on the action, e.g. "lead."' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'lead' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'ISO date lower bound' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date upper bound' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
