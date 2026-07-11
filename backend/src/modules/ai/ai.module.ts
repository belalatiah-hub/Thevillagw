import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OpenAiProvider } from './openai-ai.provider';
import { RulesAiProvider } from './rules-ai.provider';
import { AI_PROVIDER } from './ai.types';

/**
 * Binds the active AI provider: OpenAI when a key is configured, otherwise the
 * deterministic rules provider. Callers depend on the AI_PROVIDER token only.
 */
@Module({
  controllers: [AiController],
  providers: [
    AiService,
    RulesAiProvider,
    OpenAiProvider,
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, OpenAiProvider, RulesAiProvider],
      useFactory: (config: ConfigService, openai: OpenAiProvider, rules: RulesAiProvider) =>
        config.get<string>('openaiApiKey') ? openai : rules,
    },
  ],
  exports: [AiService],
})
export class AiModule {}
