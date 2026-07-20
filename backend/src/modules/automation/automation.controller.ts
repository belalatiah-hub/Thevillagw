import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from './automation.service';
import { CreateAutomationRuleDto, UpdateAutomationRuleDto } from './dto/automation.dto';

@ApiTags('automation')
@ApiBearerAuth()
@Controller('automation')
export class AutomationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automation: AutomationService,
  ) {}

  @Post('rules')
  @RequirePermissions('automation:create')
  @ApiOperation({ summary: 'Create an automation rule' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAutomationRuleDto) {
    return this.prisma.automationRule.create({
      data: {
        companyId: user.companyId,
        name: dto.name,
        trigger: dto.trigger,
        conditions: (dto.conditions ?? {}) as Prisma.InputJsonValue,
        actions: dto.actions as unknown as Prisma.InputJsonValue,
        enabled: dto.enabled ?? true,
        order: dto.order ?? 0,
      },
    });
  }

  @Get('rules')
  @RequirePermissions('automation:read')
  @ApiOperation({ summary: 'List automation rules' })
  list(@CurrentUser() user: AuthUser) {
    return this.prisma.automationRule.findMany({
      where: { companyId: user.companyId },
      orderBy: { order: 'asc' },
    });
  }

  @Patch('rules/:id')
  @RequirePermissions('automation:update')
  @ApiOperation({ summary: 'Update / enable / disable a rule' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAutomationRuleDto,
  ) {
    await this.ensure(user, id);
    return this.prisma.automationRule.update({
      where: { id },
      data: {
        name: dto.name,
        trigger: dto.trigger,
        conditions: dto.conditions ? (dto.conditions as Prisma.InputJsonValue) : undefined,
        actions: dto.actions ? (dto.actions as unknown as Prisma.InputJsonValue) : undefined,
        enabled: dto.enabled,
        order: dto.order,
      },
    });
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('automation:delete')
  @ApiOperation({ summary: 'Delete a rule' })
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.ensure(user, id);
    await this.prisma.automationRule.delete({ where: { id } });
  }

  @Get('runs')
  @RequirePermissions('automation:read')
  @ApiOperation({ summary: 'Recent automation runs (audit feed)' })
  runs(@CurrentUser() user: AuthUser) {
    return this.prisma.automationRun.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { rule: { select: { name: true } } },
    });
  }

  @Post('simulate/:leadId')
  @RequirePermissions('automation:read')
  @ApiOperation({ summary: 'Dry-run: which rules would fire for a lead (no side effects)' })
  simulate(@CurrentUser() user: AuthUser, @Param('leadId') leadId: string) {
    return this.automation.simulate(user.companyId, leadId);
  }

  private async ensure(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.automationRule.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Automation rule not found');
  }
}
