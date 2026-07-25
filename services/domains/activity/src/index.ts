// Activity Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real.

export { Activity, type ActivityProps, type ActivityType, type ActivityStatus, type CreateActivityInput } from "../domain/aggregates/activity/activity.js";

export { ActivityCreated } from "../domain/events/activity-created.js";
export { ActivityCompleted } from "../domain/events/activity-completed.js";

export type { ActivityRepository } from "../domain/repositories/activity-repository.js";

// Application Layer
export { CreateActivityCommand } from "../application/commands/create-activity/create-activity.command.js";
export { CreateActivityHandler } from "../application/handlers/create-activity/create-activity.handler.js";
export { CompleteActivityCommand } from "../application/commands/complete-activity/complete-activity.command.js";
export { CompleteActivityHandler } from "../application/handlers/complete-activity/complete-activity.handler.js";

// Case + Comment (`ADR-0043`) — adaptados do Salesforce Service Cloud/Chatter.
export { Case, type CaseProps, type CaseStatus, type CasePriority, type CreateCaseInput } from "../domain/aggregates/case/case.js";
export { CaseCreated } from "../domain/events/case-created.js";
export { CaseClosed } from "../domain/events/case-closed.js";
export type { CaseRepository } from "../domain/repositories/case-repository.js";

export { CreateCaseCommand } from "../application/commands/create-case/create-case.command.js";
export { CreateCaseHandler } from "../application/handlers/create-case/create-case.handler.js";
export { StartCaseCommand } from "../application/commands/start-case/start-case.command.js";
export { StartCaseHandler } from "../application/handlers/start-case/start-case.handler.js";
export { CloseCaseCommand } from "../application/commands/close-case/close-case.command.js";
export { CloseCaseHandler } from "../application/handlers/close-case/close-case.handler.js";

export { Comment, type CommentProps, type CreateCommentInput } from "../domain/aggregates/comment/comment.js";
export { CommentCreated } from "../domain/events/comment-created.js";
export type { CommentRepository } from "../domain/repositories/comment-repository.js";

export { CreateCommentCommand } from "../application/commands/create-comment/create-comment.command.js";
export { CreateCommentHandler } from "../application/handlers/create-comment/create-comment.handler.js";
export { UpdateCommentCommand } from "../application/commands/update-comment/update-comment.command.js";
export { UpdateCommentHandler } from "../application/handlers/update-comment/update-comment.handler.js";
export { DeleteCommentCommand } from "../application/commands/delete-comment/delete-comment.command.js";
export { DeleteCommentHandler } from "../application/handlers/delete-comment/delete-comment.handler.js";

// CalendarEvent + Reminder + Checklist (`ADR-0045`) — fecham 100% dos objetos oficiais do Activity Domain.
export {
  CalendarEvent,
  type CalendarEventProps,
  type CreateCalendarEventInput,
} from "../domain/aggregates/calendar-event/calendar-event.js";
export type { CalendarEventRepository } from "../domain/repositories/calendar-event-repository.js";
export { CreateCalendarEventCommand } from "../application/commands/create-calendar-event/create-calendar-event.command.js";
export { CreateCalendarEventHandler } from "../application/handlers/create-calendar-event/create-calendar-event.handler.js";
export { RescheduleCalendarEventCommand } from "../application/commands/reschedule-calendar-event/reschedule-calendar-event.command.js";
export { RescheduleCalendarEventHandler } from "../application/handlers/reschedule-calendar-event/reschedule-calendar-event.handler.js";

export { Reminder, type ReminderProps, type CreateReminderInput } from "../domain/aggregates/reminder/reminder.js";
export type { ReminderRepository } from "../domain/repositories/reminder-repository.js";
export { CreateReminderCommand } from "../application/commands/create-reminder/create-reminder.command.js";
export { CreateReminderHandler } from "../application/handlers/create-reminder/create-reminder.handler.js";
export { DismissReminderCommand } from "../application/commands/dismiss-reminder/dismiss-reminder.command.js";
export { DismissReminderHandler } from "../application/handlers/dismiss-reminder/dismiss-reminder.handler.js";

export { Checklist, type ChecklistProps, type CreateChecklistInput } from "../domain/aggregates/checklist/checklist.js";
export {
  ChecklistItem,
  type ChecklistItemProps,
  type CreateChecklistItemInput,
} from "../domain/entities/checklist-item/checklist-item.js";
export type { ChecklistRepository } from "../domain/repositories/checklist-repository.js";
export { CreateChecklistCommand } from "../application/commands/create-checklist/create-checklist.command.js";
export { CreateChecklistHandler } from "../application/handlers/create-checklist/create-checklist.handler.js";
export { AddChecklistItemCommand } from "../application/commands/add-checklist-item/add-checklist-item.command.js";
export { AddChecklistItemHandler } from "../application/handlers/add-checklist-item/add-checklist-item.handler.js";
export { ToggleChecklistItemCommand } from "../application/commands/toggle-checklist-item/toggle-checklist-item.command.js";
export { ToggleChecklistItemHandler } from "../application/handlers/toggle-checklist-item/toggle-checklist-item.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao pacote.
export {
  createActivityRepository,
  createCaseRepository,
  createCommentRepository,
  createCalendarEventRepository,
  createReminderRepository,
  createChecklistRepository,
} from "../infrastructure/factories.js";
