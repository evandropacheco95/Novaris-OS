import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Reminder as PrismaReminder } from "@novaris/database";
import { Reminder, type ReminderProps } from "../../domain/aggregates/reminder/reminder.js";

/** PrismaReminderMapper — tradução direta Aggregate ↔ Prisma. */
export class PrismaReminderMapper {
  static toDomain(record: PrismaReminder): Reminder {
    const props: ReminderProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyId: new UniqueEntityId(record.partyId),
      message: record.message,
      remindAt: record.remindAt,
      dismissed: record.dismissed,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Reminder.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(reminder: Reminder): PrismaReminder {
    return {
      id: reminder.id.toString(),
      organizationId: reminder.organizationId.toString(),
      partyId: reminder.partyId.toString(),
      message: reminder.message,
      remindAt: reminder.remindAt,
      dismissed: reminder.dismissed,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    };
  }
}
