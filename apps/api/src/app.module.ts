import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module.js";
import { SalesModule } from "./sales/sales.module.js";
import { CustomerModule } from "./customer/customer.module.js";
import { IdentityModule } from "./identity/identity.module.js";
import { OrganizationModule } from "./organization/organization.module.js";
import { ProjectModule } from "./project/project.module.js";
import { FinancialModule } from "./financial/financial.module.js";
import { ActivityModule } from "./activity/activity.module.js";
import { MarketingModule } from "./marketing/marketing.module.js";
import { AnalyticsModule } from "./analytics/analytics.module.js";
import { AuditModule } from "./audit/audit.module.js";
import { HealthModule } from "./monitoring/health.module.js";
import { ConfigurationModule } from "./configuration/configuration.module.js";
import { FeatureFlagModule } from "./feature-flags/feature-flag.module.js";
import { FilesModule } from "./files/files.module.js";
import { RealtimeModule } from "./realtime/realtime.module.js";
import { IntegrationHubModule } from "./integration-hub/integration-hub.module.js";
import { AutomationRuntimeModule } from "./automation-runtime/automation-runtime.module.js";
import { AIRuntimeModule } from "./ai-runtime/ai-runtime.module.js";

@Module({
  imports: [
    AuthModule,
    SalesModule,
    CustomerModule,
    IdentityModule,
    OrganizationModule,
    ProjectModule,
    FinancialModule,
    ActivityModule,
    MarketingModule,
    AnalyticsModule,
    AuditModule,
    HealthModule,
    ConfigurationModule,
    FeatureFlagModule,
    FilesModule,
    RealtimeModule,
    IntegrationHubModule,
    AutomationRuntimeModule,
    AIRuntimeModule,
  ],
})
export class AppModule {}
