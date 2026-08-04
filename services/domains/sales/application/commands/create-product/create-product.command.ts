/** Perfil fiscal-logístico (`ENG-0166`) — todos opcionais, ver `product.ts`. */
export interface CreateProductCommandInput {
  readonly organizationId: string;
  readonly name: string;
  readonly sku?: string;
  readonly unitPrice: number;
  readonly ncm?: string;
  readonly cfop?: string;
  readonly unit?: string;
  readonly weightKg?: number;
  readonly lengthCm?: number;
  readonly widthCm?: number;
  readonly heightCm?: number;
  readonly parentProductId?: string;
  readonly variantLabel?: string;
  readonly externalId?: string;
}

export class CreateProductCommand {
  readonly organizationId: string;
  readonly name: string;
  readonly sku?: string;
  readonly unitPrice: number;
  readonly ncm?: string;
  readonly cfop?: string;
  readonly unit?: string;
  readonly weightKg?: number;
  readonly lengthCm?: number;
  readonly widthCm?: number;
  readonly heightCm?: number;
  readonly parentProductId?: string;
  readonly variantLabel?: string;
  readonly externalId?: string;

  constructor(input: CreateProductCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    this.sku = input.sku;
    this.unitPrice = input.unitPrice;
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
