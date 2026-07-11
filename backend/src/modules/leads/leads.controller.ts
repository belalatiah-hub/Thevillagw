import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import {
  AssignLeadDto,
  CaptureLeadDto,
  CreateLeadDto,
  QueryLeadsDto,
  UpdateLeadDto,
} from './dto/lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leads: LeadsService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Public lead capture for the marketing site. This is the endpoint the
   * website's `LEAD_ENDPOINT` posts to. Optionally protected by a shared
   * `x-capture-key` header and tightly rate-limited to resist spam/abuse.
   */
  @Public()
  @Post('capture')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: capture a lead from the website / landing pages' })
  capture(@Body() dto: CaptureLeadDto, @Headers('x-capture-key') key?: string) {
    const expected = this.config.get<string>('leadCaptureKey');
    if (expected && key !== expected) {
      throw new BadRequestException('Invalid capture key');
    }
    return this.leads.capture(dto);
  }

  /**
   * Drop-in target for the marketing site's `CONFIG.LEAD_ENDPOINT`. The site
   * posts `{name, phone, source, page, ...}` as text/plain with `no-cors`, so
   * the response is opaque to the browser — that's fine, we just need a 2xx.
   * Set `LEAD_ENDPOINT` to `<api>/api/leads/site/<companySlug>`.
   */
  @Public()
  @Post('site/:companySlug')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Public: capture a lead in the website’s native payload shape' })
  captureFromSite(@Param('companySlug') companySlug: string, @Req() req: Request) {
    // Body is an object (application/json) or a JSON string (text/plain).
    let payload: Record<string, unknown> = {};
    const body = req.body as unknown;
    if (typeof body === 'string') {
      try {
        payload = JSON.parse(body || '{}');
      } catch {
        throw new BadRequestException('Malformed lead payload');
      }
    } else if (body && typeof body === 'object') {
      payload = body as Record<string, unknown>;
    }
    return this.leads.captureFromSite(companySlug, payload);
  }

  @Post()
  @RequirePermissions('lead:create')
  @ApiOperation({ summary: 'Create a lead' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLeadDto) {
    return this.leads.create(user, dto);
  }

  @Get()
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: 'List / search leads (paginated)' })
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryLeadsDto) {
    return this.leads.findAll(user, query);
  }

  @Get(':id')
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: 'Get one lead with its activity timeline' })
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.leads.findOne(user, id);
  }

  @Patch(':id')
  @RequirePermissions('lead:update')
  @ApiOperation({ summary: 'Update a lead (status changes log an activity)' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(user, id, dto);
  }

  @Patch(':id/assign')
  @RequirePermissions('lead:assign')
  @ApiOperation({ summary: 'Assign a lead to an owner' })
  assign(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AssignLeadDto) {
    return this.leads.assign(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('lead:delete')
  @ApiOperation({ summary: 'Delete a lead' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.leads.remove(user, id);
  }
}
