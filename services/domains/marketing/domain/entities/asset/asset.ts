import { Entity } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";

/**
 * Asset — Internal Entity do Aggregate `Campaign` (`ADR-0048`), mesmo padrão
 * estrutural de `QuotationLineItem`/`ChecklistItem`. Referencia um
 * `FileRecord` (Kernel, `@novaris/files`) por id — nunca embute o Aggregate
 * inteiro. O upload do arquivo em si acontece via `POST /files` (já
 * existente); `Asset` só representa a associação com uma Campaign.
 */

export interface AssetProps {
  fileRecordId: UniqueEntityId;
  addedAt: Date;
}

export interface CreateAssetInput {
  fileRecordId: UniqueEntityId;
}

export class Asset extends Entity<AssetProps> {
  private constructor(props: AssetProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateAssetInput): Asset {
    return new Asset({ fileRecordId: input.fileRecordId, addedAt: new Date() });
  }

  /** Usado exclusivamente por `Campaign` ao reconstituir a partir de persistência. */
  static reconstitute(props: AssetProps, id: UniqueEntityId): Asset {
    return new Asset(props, id);
  }

  get fileRecordId(): UniqueEntityId {
    return this.props.fileRecordId;
  }

  get addedAt(): Date {
    return this.props.addedAt;
  }
}
