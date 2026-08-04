/**
 * UpdateFiscalLogisticsProfileCommand — Application Layer, Sales Domain
 * (`ENG-0166`). `undefined` = não enviado, não mexer; `null` = remover o
 * valor explicitamente — mesma distinção de `UpdateOrganizationPlanCommand`.
 */
export interface UpdateFiscalLogisticsProfileCommandInput {
  readonly productId: string;
  readonly ncm?: string | null;
  readonly cfop?: string | null;
  readonly unit?: string | null;
  readonly weightKg?: number | null;
  readonly lengthCm?: number | null;
  readonly widthCm?: number | null;
  readonly heightCm?: number | null;
  readonly parentProductId?: string | null;
  readonly variantLabel?: string | null;
  readonly externalId?: string | null;
}

export class UpdateFiscalLogisticsProfileCommand {
  readonly productId: string;
  readonly ncm?: string | null;
  readonly cfop?: string | null;
  readonly unit?: string | null;
  readonly weightKg?: number | null;
  readonly lengthCm?: number | null;
  readonly widthCm?: number | null;
  readonly heightCm?: number | null;
  readonly parentProductId?: string | null;
  readonly variantLabel?: string | null;
  readonly externalId?: string | null;

  constructor(input: UpdateFiscalLogisticsProfileCommandInput) {
    this.productId = input.productId;
    this.ncm = input.ncm;
    this.cfop = input.cfop;
    this.unit = input.unit;
    this.weightKg = input.weightKg;
    this.lengthCm = input.lengthCm;
    this.widthCm = input.widthCm;
    this.heightCm = input.heightCm;
    this.parentProductId = input.parentProductId;
    this.variantLabel = input.variantLabel;
    this.externalId = input.externalId;
    Object.freeze(this);
  }
}
