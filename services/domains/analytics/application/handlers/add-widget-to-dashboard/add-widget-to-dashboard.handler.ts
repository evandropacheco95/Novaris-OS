import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Dashboard } from "../../../domain/aggregates/dashboard/dashboard.js";
import type { DashboardRepository } from "../../../domain/repositories/dashboard-repository.js";
import type { AddWidgetToDashboardCommand } from "../../commands/add-widget-to-dashboard/add-widget-to-dashboard.command.js";

/** AddWidgetToDashboardHandler — Application Layer, Analytics Domain (`ADR-0049`). Composição intra-domínio, mesmo padrão de `AddQuotationLineItemHandler`/`AddAssetToCampaignHandler`, mas sem dependência externa — `Widget` só guarda configuração de exibição. */
export class AddWidgetToDashboardHandler {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(command: AddWidgetToDashboardCommand): Promise<Result<Dashboard, DomainError | InfrastructureError>> {
    const findResult = await this.dashboardRepository.findById(new UniqueEntityId(command.dashboardId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Dashboard "${command.dashboardId}" não encontrado`));
    }
    const dashboard = option.getOrElse(null as never);

    const addResult = dashboard.addWidget({ type: command.type, title: command.title, metricKey: command.metricKey });
    if (addResult.isFailure) {
      return Result.fail(addResult.getError()!);
    }

    const saveResult = await this.dashboardRepository.save(dashboard);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(dashboard);
  }
}
