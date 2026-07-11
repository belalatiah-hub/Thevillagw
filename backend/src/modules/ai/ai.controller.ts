import { Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AiService } from './ai.service';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('leads/:id/summary')
  @RequirePermissions('lead:read')
  @ApiOperation({ summary: 'AI summary + recommended next action for a lead' })
  summarize(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ai.summarizeLead(user, id);
  }
}
