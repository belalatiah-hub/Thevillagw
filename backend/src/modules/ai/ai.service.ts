import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { AI_PROVIDER, AiProvider, AiSummary } from './ai.types';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AI_PROVIDER) private readonly provider: AiProvider,
  ) {}

  /**
   * Summarise a lead and recommend a next action. Persists the summary back on
   * the lead (aiSummary) so the UI can show it without re-calling the model.
   */
  async summarizeLead(user: AuthUser, leadId: string): Promise<AiSummary> {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId: user.companyId },
    });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    const recentActivities = await this.prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { type: true, subject: true, createdAt: true },
    });

    const result = await this.provider.summarizeLead({ lead, recentActivities });

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { aiSummary: result.summary },
    });
    return result;
  }
}
