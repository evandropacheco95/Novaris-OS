import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import {
  createActivityRepository,
  createCaseRepository,
  createCommentRepository,
  createCalendarEventRepository,
  createReminderRepository,
  createChecklistRepository,
  CreateActivityHandler,
  CompleteActivityHandler,
  CreateCaseHandler,
  StartCaseHandler,
  CloseCaseHandler,
  CreateCommentHandler,
  UpdateCommentHandler,
  DeleteCommentHandler,
  CreateCalendarEventHandler,
  RescheduleCalendarEventHandler,
  CreateReminderHandler,
  DismissReminderHandler,
  CreateChecklistHandler,
  AddChecklistItemHandler,
  ToggleChecklistItemHandler,
} from "@novaris/activity";
import { AuthModule } from "../auth/auth.module.js";
import { ActivityController } from "./activity.controller.js";
import { CaseController } from "./case.controller.js";
import { CommentController } from "./comment.controller.js";
import { CalendarEventController } from "./calendar-event.controller.js";
import { ReminderController } from "./reminder.controller.js";
import { ChecklistController } from "./checklist.controller.js";

const ACTIVITY_REPOSITORY = "ACTIVITY_REPOSITORY";
const CASE_REPOSITORY = "CASE_REPOSITORY";
const COMMENT_REPOSITORY = "COMMENT_REPOSITORY";
const CALENDAR_EVENT_REPOSITORY = "CALENDAR_EVENT_REPOSITORY";
const REMINDER_REPOSITORY = "REMINDER_REPOSITORY";
const CHECKLIST_REPOSITORY = "CHECKLIST_REPOSITORY";

/** ActivityModule — Composition Root do Activity Domain (`ENG-0133`, estendido em `ADR-0043`/`ADR-0045`). */
@Module({
  imports: [AuthModule],
  controllers: [ActivityController, CaseController, CommentController, CalendarEventController, ReminderController, ChecklistController],
  providers: [
    { provide: ACTIVITY_REPOSITORY, useFactory: () => createActivityRepository(prisma) },
    {
      provide: CreateActivityHandler,
      useFactory: (repository: ReturnType<typeof createActivityRepository>) => new CreateActivityHandler(repository),
      inject: [ACTIVITY_REPOSITORY],
    },
    {
      provide: CompleteActivityHandler,
      useFactory: (repository: ReturnType<typeof createActivityRepository>) => new CompleteActivityHandler(repository),
      inject: [ACTIVITY_REPOSITORY],
    },
    { provide: "ActivityRepository", useExisting: ACTIVITY_REPOSITORY },
    { provide: CASE_REPOSITORY, useFactory: () => createCaseRepository(prisma) },
    {
      provide: CreateCaseHandler,
      useFactory: (repository: ReturnType<typeof createCaseRepository>) => new CreateCaseHandler(repository),
      inject: [CASE_REPOSITORY],
    },
    {
      provide: StartCaseHandler,
      useFactory: (repository: ReturnType<typeof createCaseRepository>) => new StartCaseHandler(repository),
      inject: [CASE_REPOSITORY],
    },
    {
      provide: CloseCaseHandler,
      useFactory: (repository: ReturnType<typeof createCaseRepository>) => new CloseCaseHandler(repository),
      inject: [CASE_REPOSITORY],
    },
    { provide: "CaseRepository", useExisting: CASE_REPOSITORY },
    { provide: COMMENT_REPOSITORY, useFactory: () => createCommentRepository(prisma) },
    {
      provide: CreateCommentHandler,
      useFactory: (repository: ReturnType<typeof createCommentRepository>) => new CreateCommentHandler(repository),
      inject: [COMMENT_REPOSITORY],
    },
    {
      provide: UpdateCommentHandler,
      useFactory: (repository: ReturnType<typeof createCommentRepository>) => new UpdateCommentHandler(repository),
      inject: [COMMENT_REPOSITORY],
    },
    {
      provide: DeleteCommentHandler,
      useFactory: (repository: ReturnType<typeof createCommentRepository>) => new DeleteCommentHandler(repository),
      inject: [COMMENT_REPOSITORY],
    },
    { provide: "CommentRepository", useExisting: COMMENT_REPOSITORY },
    { provide: CALENDAR_EVENT_REPOSITORY, useFactory: () => createCalendarEventRepository(prisma) },
    {
      provide: CreateCalendarEventHandler,
      useFactory: (repository: ReturnType<typeof createCalendarEventRepository>) => new CreateCalendarEventHandler(repository),
      inject: [CALENDAR_EVENT_REPOSITORY],
    },
    {
      provide: RescheduleCalendarEventHandler,
      useFactory: (repository: ReturnType<typeof createCalendarEventRepository>) => new RescheduleCalendarEventHandler(repository),
      inject: [CALENDAR_EVENT_REPOSITORY],
    },
    { provide: "CalendarEventRepository", useExisting: CALENDAR_EVENT_REPOSITORY },
    { provide: REMINDER_REPOSITORY, useFactory: () => createReminderRepository(prisma) },
    {
      provide: CreateReminderHandler,
      useFactory: (repository: ReturnType<typeof createReminderRepository>) => new CreateReminderHandler(repository),
      inject: [REMINDER_REPOSITORY],
    },
    {
      provide: DismissReminderHandler,
      useFactory: (repository: ReturnType<typeof createReminderRepository>) => new DismissReminderHandler(repository),
      inject: [REMINDER_REPOSITORY],
    },
    { provide: "ReminderRepository", useExisting: REMINDER_REPOSITORY },
    { provide: CHECKLIST_REPOSITORY, useFactory: () => createChecklistRepository(prisma) },
    {
      provide: CreateChecklistHandler,
      useFactory: (repository: ReturnType<typeof createChecklistRepository>) => new CreateChecklistHandler(repository),
      inject: [CHECKLIST_REPOSITORY],
    },
    {
      provide: AddChecklistItemHandler,
      useFactory: (repository: ReturnType<typeof createChecklistRepository>) => new AddChecklistItemHandler(repository),
      inject: [CHECKLIST_REPOSITORY],
    },
    {
      provide: ToggleChecklistItemHandler,
      useFactory: (repository: ReturnType<typeof createChecklistRepository>) => new ToggleChecklistItemHandler(repository),
      inject: [CHECKLIST_REPOSITORY],
    },
    { provide: "ChecklistRepository", useExisting: CHECKLIST_REPOSITORY },
  ],
})
export class ActivityModule {}
