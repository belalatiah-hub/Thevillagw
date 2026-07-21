import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LeadsModule } from './modules/leads/leads.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DevelopersModule } from './modules/developers/developers.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UnitsModule } from './modules/units/units.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { HealthModule } from './modules/health/health.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';
import { EventsModule } from './modules/events/events.module';
import { FinanceModule } from './modules/finance/finance.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AutomationModule } from './modules/automation/automation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RolesModule } from './modules/roles/roles.module';
import { OrgModule } from './modules/org/org.module';
import { AuditModule } from './modules/audit/audit.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TelephonyModule } from './modules/telephony/telephony.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { LookupsModule } from './modules/lookups/lookups.module';
import { ActionsModule } from './modules/actions/actions.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ScopeModule } from './common/scope/scope.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('throttle.ttl') ?? 60) * 1000,
          limit: config.get<number>('throttle.limit') ?? 120,
        },
      ],
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    CustomersModule,
    DevelopersModule,
    ProjectsModule,
    UnitsModule,
    PipelineModule,
    HealthModule,
    ReportsModule,
    AiModule,
    EventsModule,
    FinanceModule,
    IntegrationsModule,
    AutomationModule,
    NotificationsModule,
    RolesModule,
    OrgModule,
    AuditModule,
    SettingsModule,
    ScopeModule,
    TelephonyModule,
    WhatsappModule,
    DistributionModule,
    LookupsModule,
    ActionsModule,
  ],
  providers: [
    // Order matters: authenticate → rate-limit → authorize.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
