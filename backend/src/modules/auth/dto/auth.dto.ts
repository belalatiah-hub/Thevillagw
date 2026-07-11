import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'sales@thevillageinvestment.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'S3cure!Passw0rd' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'sales@thevillageinvestment.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'S3cure!Passw0rd',
    description: 'Min 8 chars, at least one letter and one number',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({ example: 'Layla' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Hassan' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false, example: '+20 100 000 0000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    required: false,
    description: 'Existing company id to join. Omit to provision a new company (first user).',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiProperty({
    required: false,
    description: 'Company name — used when provisioning a new company.',
  })
  @IsOptional()
  @IsString()
  companyName?: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class TokenPairDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: string;
}
