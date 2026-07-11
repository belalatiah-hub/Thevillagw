import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Opportunity, OpportunityStatus, Pipeline } from '@prisma/client';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { DOMAIN_EVENTS } from '../../common/events/domain-events';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateOpportunityDto,
  CreatePipelineDto,
  MoveOpportunityDto,
  UpdateOpportunityDto,
  UpdatePipelineDto,
} from './dto/pipeline.dto';

export interface ForecastRow {
  stageId: string;
  stageName: string;
  probability: number;
  count: number;
  totalValueMinor: string;
  weightedValueMinor: string;
}

@Injectable()
export class PipelineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  // ── Pipelines ────────────────────────────────────────────────────────────

  async createPipeline(user: AuthUser, dto: CreatePipelineDto): Promise<Pipeline> {
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { companyId: user.companyId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.pipeline.create({
      data: {
        companyId: user.companyId,
        name: dto.name,
        isDefault: dto.isDefault ?? false,
        stages: {
          create: dto.stages.map((s) => ({
            name: s.name,
            order: s.order,
            probability: s.probability ?? 0,
            isWon: s.isWon ?? false,
            isLost: s.isLost ?? false,
          })),
        },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  listPipelines(user: AuthUser): Promise<Pipeline[]> {
    return this.prisma.pipeline.findMany({
      where: { companyId: user.companyId },
      include: {
        stages: { orderBy: { order: 'asc' } },
        _count: { select: { opportunities: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPipeline(user: AuthUser, id: string): Promise<Pipeline> {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            opportunities: {
              where: { status: OpportunityStatus.OPEN },
              orderBy: { updatedAt: 'desc' },
            },
          },
        },
      },
    });
    if (!pipeline) {
      throw new NotFoundException('Pipeline not found');
    }
    return pipeline;
  }

  async updatePipeline(user: AuthUser, id: string, dto: UpdatePipelineDto): Promise<Pipeline> {
    await this.assertPipeline(user, id);
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({
        where: { companyId: user.companyId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }
    return this.prisma.pipeline.update({
      where: { id },
      data: { name: dto.name, isDefault: dto.isDefault },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  }

  /** Weighted forecast: Σ(open value × stage probability) grouped by stage. */
  async forecast(user: AuthUser, pipelineId: string): Promise<ForecastRow[]> {
    await this.assertPipeline(user, pipelineId);
    const stages = await this.prisma.pipelineStage.findMany({
      where: { pipelineId },
      orderBy: { order: 'asc' },
      include: {
        opportunities: {
          where: { status: OpportunityStatus.OPEN },
          select: { valueMinor: true },
        },
      },
    });

    return stages.map((stage) => {
      const total = stage.opportunities.reduce((sum, o) => sum + o.valueMinor, 0n);
      const weighted = (total * BigInt(stage.probability)) / 100n;
      return {
        stageId: stage.id,
        stageName: stage.name,
        probability: stage.probability,
        count: stage.opportunities.length,
        totalValueMinor: total.toString(),
        weightedValueMinor: weighted.toString(),
      };
    });
  }

  // ── Opportunities ──────────────────────────────────────────────────────────

  async createOpportunity(user: AuthUser, dto: CreateOpportunityDto): Promise<Opportunity> {
    await this.assertStageInPipeline(user, dto.pipelineId, dto.stageId);
    return this.prisma.opportunity.create({
      data: {
        companyId: user.companyId,
        pipelineId: dto.pipelineId,
        stageId: dto.stageId,
        title: dto.title,
        valueMinor: dto.valueMinor != null ? BigInt(dto.valueMinor) : 0n,
        currency: dto.currency,
        customerId: dto.customerId,
        leadId: dto.leadId,
        projectId: dto.projectId,
        unitId: dto.unitId,
        ownerId: dto.ownerId ?? user.id,
        expectedClose: dto.expectedClose ? new Date(dto.expectedClose) : undefined,
      },
    });
  }

  async moveOpportunity(user: AuthUser, id: string, dto: MoveOpportunityDto): Promise<Opportunity> {
    const opp = await this.assertOpportunity(user, id);
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id: dto.stageId, pipelineId: opp.pipelineId },
    });
    if (!stage) {
      throw new BadRequestException('Target stage does not belong to this opportunity’s pipeline');
    }
    const status = stage.isWon
      ? OpportunityStatus.WON
      : stage.isLost
        ? OpportunityStatus.LOST
        : OpportunityStatus.OPEN;
    const moved = await this.prisma.opportunity.update({
      where: { id },
      data: { stageId: dto.stageId, status },
    });
    this.events.emit(DOMAIN_EVENTS.OPPORTUNITY_MOVED, {
      companyId: user.companyId,
      opportunityId: id,
      stageId: dto.stageId,
      status,
    });
    return moved;
  }

  async updateOpportunity(
    user: AuthUser,
    id: string,
    dto: UpdateOpportunityDto,
  ): Promise<Opportunity> {
    await this.assertOpportunity(user, id);
    if (dto.status === OpportunityStatus.LOST && !dto.lostReason) {
      throw new BadRequestException('lostReason is required when marking an opportunity LOST');
    }
    return this.prisma.opportunity.update({
      where: { id },
      data: {
        title: dto.title,
        valueMinor: dto.valueMinor != null ? BigInt(dto.valueMinor) : undefined,
        currency: dto.currency,
        status: dto.status,
        lostReason: dto.lostReason,
        customerId: dto.customerId,
        unitId: dto.unitId,
        projectId: dto.projectId,
        ownerId: dto.ownerId,
        expectedClose: dto.expectedClose ? new Date(dto.expectedClose) : undefined,
      },
    });
  }

  async removeOpportunity(user: AuthUser, id: string): Promise<void> {
    await this.assertOpportunity(user, id);
    await this.prisma.opportunity.delete({ where: { id } });
  }

  // ── guards ───────────────────────────────────────────────────────────────

  private async assertPipeline(user: AuthUser, id: string): Promise<void> {
    const found = await this.prisma.pipeline.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException('Pipeline not found');
    }
  }

  private async assertStageInPipeline(
    user: AuthUser,
    pipelineId: string,
    stageId: string,
  ): Promise<void> {
    await this.assertPipeline(user, pipelineId);
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id: stageId, pipelineId },
      select: { id: true },
    });
    if (!stage) {
      throw new BadRequestException('stageId does not belong to the given pipeline');
    }
  }

  private async assertOpportunity(user: AuthUser, id: string): Promise<Opportunity> {
    const opp = await this.prisma.opportunity.findFirst({
      where: { id, companyId: user.companyId },
    });
    if (!opp) {
      throw new NotFoundException('Opportunity not found');
    }
    return opp;
  }
}
