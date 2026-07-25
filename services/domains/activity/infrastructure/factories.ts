import type { PrismaClient } from "@novaris/database";
import type { ActivityRepository } from "../domain/repositories/activity-repository.js";
import type { CaseRepository } from "../domain/repositories/case-repository.js";
import type { CommentRepository } from "../domain/repositories/comment-repository.js";
import type { CalendarEventRepository } from "../domain/repositories/calendar-event-repository.js";
import type { ReminderRepository } from "../domain/repositories/reminder-repository.js";
import type { ChecklistRepository } from "../domain/repositories/checklist-repository.js";
import { PrismaActivityRepository } from "./repositories/prisma-activity-repository.js";
import { PrismaCaseRepository } from "./repositories/prisma-case-repository.js";
import { PrismaCommentRepository } from "./repositories/prisma-comment-repository.js";
import { PrismaCalendarEventRepository } from "./repositories/prisma-calendar-event-repository.js";
import { PrismaReminderRepository } from "./repositories/prisma-reminder-repository.js";
import { PrismaChecklistRepository } from "./repositories/prisma-checklist-repository.js";

/** Factories de Infrastructure — mantêm as classes concretas privadas ao pacote. */
export function createActivityRepository(client: PrismaClient): ActivityRepository {
  return new PrismaActivityRepository(client);
}

export function createCaseRepository(client: PrismaClient): CaseRepository {
  return new PrismaCaseRepository(client);
}

export function createCommentRepository(client: PrismaClient): CommentRepository {
  return new PrismaCommentRepository(client);
}

export function createCalendarEventRepository(client: PrismaClient): CalendarEventRepository {
  return new PrismaCalendarEventRepository(client);
}

export function createReminderRepository(client: PrismaClient): ReminderRepository {
  return new PrismaReminderRepository(client);
}

export function createChecklistRepository(client: PrismaClient): ChecklistRepository {
  return new PrismaChecklistRepository(client);
}
