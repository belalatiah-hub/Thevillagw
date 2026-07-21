import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Regional Sales Lead' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [String], example: ['lead:read', 'lead:create', 'customer:read'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Regional Sales Lead' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replaces the full permission set' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
