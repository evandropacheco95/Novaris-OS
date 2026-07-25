import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Checklist as PrismaChecklist, ChecklistItem as PrismaChecklistItem } from "@novaris/database";
import { Checklist, type ChecklistProps } from "../../domain/aggregates/checklist/checklist.js";
import { ChecklistItem, type ChecklistItemProps } from "../../domain/entities/checklist-item/checklist-item.js";

type PrismaChecklistWithItems = PrismaChecklist & { items: PrismaChecklistItem[] };

/** PrismaChecklistMapper — tradução direta Aggregate ↔ Prisma, reconstitui a coleção `items` (tabela própria), mesmo padrão de `PrismaQuotationMapper`. */
export class PrismaChecklistMapper {
  static toDomain(record: PrismaChecklistWithItems): Checklist {
    const items = record.items.map((itemRecord) => {
      const props: ChecklistItemProps = { label: itemRecord.label, completed: itemRecord.completed };
      return ChecklistItem.reconstitute(props, new UniqueEntityId(itemRecord.id));
    });

    const props: ChecklistProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyId: new UniqueEntityId(record.partyId),
      title: record.title,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Checklist.reconstitute(props, new UniqueEntityId(record.id), items);
  }

  /** Campos de escrita da própria Checklist (sem `items` — sincronizados separadamente pelo Repository). */
  static toPersistence(checklist: Checklist): PrismaChecklist {
    return {
      id: checklist.id.toString(),
      organizationId: checklist.organizationId.toString(),
      partyId: checklist.partyId.toString(),
      title: checklist.title,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
    };
  }
}
