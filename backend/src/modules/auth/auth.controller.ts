import { Body, Controller, Post, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto, TokenPairDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private meta(req: Request) {
    return { ip: req.ip, userAgent: req.get('user-agent') ?? undefined };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a user (provisions a new company if none given)' })
  @ApiResponse({ status: 201, type: TokenPairDto })
  register(@Body() dto: RegisterDto, @Req() req: Request): Promise<TokenPairDto> {
    return this.auth.register(dto, this.meta(req));
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email + password' })
  @ApiResponse({ status: 200, type: TokenPairDto })
  login(@Body() dto: LoginDto, @Req() req: Request): Promise<TokenPairDto> {
    return this.auth.login(dto, this.meta(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate an access/refresh token pair' })
  @ApiResponse({ status: 200, type: TokenPairDto })
  refresh(@Body() dto: RefreshDto, @Req() req: Request): Promise<TokenPairDto> {
    return this.auth.refresh(dto.refreshToken, this.meta(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens for the current user' })
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.auth.logout(userId);
  }
}
