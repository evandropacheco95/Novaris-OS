import type { WidgetType } from "../../../domain/entities/widget/widget.js";

export interface AddWidgetToDashboardCommandInput {
  readonly dashboardId: string;
  readonly type: WidgetType;
  readonly title: string;
  readonly metricKey: string;
}

export class AddWidgetToDashboardCommand {
  readonly dashboardId: string;
  readonly type: WidgetType;
  readonly title: string;
  readonly metricKey: string;

  constructor(input: AddWidgetToDashboardCommandInput) {
    this.dashboardId = input.dashboardId;
    this.type = input.type;
    this.title = input.title;
    this.metricKey = input.metricKey;
    Object.freeze(this);
  }
}
