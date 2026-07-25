import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Dashboard } from "../../../domain/aggregates/dashboard/dashboard.js";
import type { DashboardRepository } from "../../../domain/repositories/dashboard-repository.js";
import type { CreateDashboardCommand } from "../../commands/create-dashboard/create-dashboard.command.js";

/** CreateDashboardHandler — Application Layer, Analytics Domain. Orquestra: `CreateDashboardCommand` → `Dashboard.create()` → `DashboardRepository.save()`. */
export class CreateDashboardHandler {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async execute(command: CreateDashboardCommand): Promise<Result<Dashboard, DomainError | InfrastructureError>> {
    const createResult = Dashboard.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const dashboard = createResult.getValue()!;
    const saveResult = await this.dashboardRepository.save(dashboard);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(dashboard);
  }
}
