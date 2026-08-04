import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Product — Aggregate Root do Sales Domain (`ADR-0043`), catálogo interno,
 * adaptado do Salesforce Product2. Preço único por Product — sem múltiplos
 * Price Books nomeados (Standard/Regional/etc.), sem evidência de
 * necessidade. Sem Domain Event — mesmo critério de `Party`/`Campaign`/
 * `Dashboard` (objetos de cadastro sem evento de negócio confirmado).
 *
 * **Perfil fiscal-logístico** (`ENG-0166`, decisão direta do CTO) — todos os
 * campos abaixo de `ncm` a `externalId` são opcionais e não têm efeito em
 * nenhum tenant que não os preencha (preserva 100% o comportamento de todo
 * Product já existente). Extraídos diretamente do schema real do projeto
 * Winnet (`Desktop/Winnet/CRM-WINNET-COMPLETO/database/02_tables.sql`,
 * tabela `produtos`) — cliente real de indústria+e-commerce da Elite
 * Negócios, usado como referência por pedido explícito do CTO. Nenhum campo
 * aqui foi inventado sem essa fonte.
 */

export interface ProductProps {
  organizationId: UniqueEntityId;
  name: string;
  sku?: string;
  unitPrice: number;
  active: boolean;
  /** Nomenclatura Comum do Mercosul — 8 dígitos, classificação fiscal do produto. */
  ncm?: string;
  /** Código Fiscal de Operações e Prestações — 4 dígitos, natureza da operação. */
  cfop?: string;
  /** Unidade de medida (`UN`/`KG`/`CX`/etc.) — texto livre, mesma forma da fonte (Winnet não tem enum fechado). */
  unit?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  /** Referência ao Product "pai" — variação (cor/tamanho) de um produto principal. */
  parentProductId?: UniqueEntityId;
  /** Rótulo da variação (ex.: "Azul - M") — só tem sentido quando `parentProductId` está presente. */
  variantLabel?: string;
  /** Id do produto no sistema de origem (ERP/marketplace) — usado por um Connector futuro para upsert idempotente. */
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  organizationId: UniqueEntityId;
  name: string;
  sku?: string;
  unitPrice: number;
  ncm?: string;
  cfop?: string;
  unit?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  parentProductId?: UniqueEntityId;
  variantLabel?: string;
  externalId?: string;
}

/**
 * Todos os campos opcionais — `PATCH` parcial, mesmo padrão de
 * `Organization.updatePlan()`. `undefined` = não mexer; `null` = remover o
 * valor explicitamente (distinção necessária porque ambos os estados são
 * legítimos num campo já opcional).
 */
export interface UpdateFiscalLogisticsProfileInput {
  ncm?: string | null;
  cfop?: string | null;
  unit?: string | null;
  weightKg?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  parentProductId?: UniqueEntityId | null;
  variantLabel?: string | null;
  externalId?: string | null;
}

const NCM_PATTERN = /^\d{8}$/;
const CFOP_PATTERN = /^\d{4}$/;

/**
 * Validações de formato — só as que são fato técnico estável (NCM tem
 * exatamente 8 dígitos, CFOP exatamente 4, por padrão da Receita Federal),
 * nunca uma regra de negócio inventada. Peso/dimensões só precisam ser
 * não-negativos, mesmo critério de `unitPrice`.
 */
function validateFiscalLogisticsProfile(input: {
  ncm?: string;
  cfop?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}): ValidationError | undefined {
  if (input.ncm !== undefined && !NCM_PATTERN.test(input.ncm)) {
    return new ValidationError('"ncm" deve ter exatamente 8 dígitos');
  }
  if (input.cfop !== undefined && !CFOP_PATTERN.test(input.cfop)) {
    return new ValidationError('"cfop" deve ter exatamente 4 dígitos');
  }
  for (const [field, value] of Object.entries({
    weightKg: input.weightKg,
    lengthCm: input.lengthCm,
    widthCm: input.widthCm,
    heightCm: input.heightCm,
  })) {
    if (value !== undefined && value < 0) {
      return new ValidationError(`"${field}" não pode ser negativo`);
    }
  }
  return undefined;
}

export class Product extends AggregateRoot<ProductProps> implements Timestamped {
  private constructor(props: ProductProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. Nasce sempre `active: true`. */
  static create(input: CreateProductInput): Result<Product, DomainError> {
    if (!input.name || input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }
    if (input.unitPrice < 0) {
      return Result.fail(new ValidationError('"unitPrice" não pode ser negativo'));
    }
    const fiscalLogisticsError = validateFiscalLogisticsProfile(input);
    if (fiscalLogisticsError) {
      return Result.fail(fiscalLogisticsError);
    }

    const now = new Date();
    const props: ProductProps = {
      organizationId: input.organizationId,
      name: input.name,
      sku: input.sku,
      unitPrice: input.unitPrice,
      active: true,
      ncm: input.ncm,
      cfop: input.cfop,
      unit: input.unit,
      weightKg: input.weightKg,
      lengthCm: input.lengthCm,
      widthCm: input.widthCm,
      heightCm: input.heightCm,
      parentProductId: input.parentProductId,
      variantLabel: input.variantLabel,
      externalId: input.externalId,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Product(props));
  }

  static reconstitute(props: ProductProps, id: UniqueEntityId): Product {
    return new Product(props, id);
  }

  /** Atualiza o preço unitário — não afeta `QuotationLineItem`s já criados (snapshot próprio). */
  updatePrice(newPrice: number): Result<void, DomainError> {
    if (newPrice < 0) {
      return Result.fail(new ValidationError('"unitPrice" não pode ser negativo'));
    }
    this.props.unitPrice = newPrice;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /** `ENG-0166` — ver nota de topo do arquivo. `null` remove o valor, `undefined` não mexe. */
  updateFiscalLogisticsProfile(input: UpdateFiscalLogisticsProfileInput): Result<void, DomainError> {
    if (input.parentProductId !== undefined && input.parentProductId !== null && input.parentProductId.equals(this.id)) {
      return Result.fail(new ValidationError('"parentProductId" não pode ser o próprio Product'));
    }
    const validationError = validateFiscalLogisticsProfile({
      ncm: input.ncm ?? undefined,
      cfop: input.cfop ?? undefined,
      weightKg: input.weightKg ?? undefined,
      lengthCm: input.lengthCm ?? undefined,
      widthCm: input.widthCm ?? undefined,
      heightCm: input.heightCm ?? undefined,
    });
    if (validationError) {
      return Result.fail(validationError);
    }

    if (input.ncm !== undefined) this.props.ncm = input.ncm ?? undefined;
    if (input.cfop !== undefined) this.props.cfop = input.cfop ?? undefined;
    if (input.unit !== undefined) this.props.unit = input.unit ?? undefined;
    if (input.weightKg !== undefined) this.props.weightKg = input.weightKg ?? undefined;
    if (input.lengthCm !== undefined) this.props.lengthCm = input.lengthCm ?? undefined;
    if (input.widthCm !== undefined) this.props.widthCm = input.widthCm ?? undefined;
    if (input.heightCm !== undefined) this.props.heightCm = input.heightCm ?? undefined;
    if (input.parentProductId !== undefined) this.props.parentProductId = input.parentProductId ?? undefined;
    if (input.variantLabel !== undefined) this.props.variantLabel = input.variantLabel ?? undefined;
    if (input.externalId !== undefined) this.props.externalId = input.externalId ?? undefined;

    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  deactivate(): Result<void, DomainError> {
    if (!this.props.active) {
      return Result.fail(new ConflictError("Product já está inativo"));
    }
    this.props.active = false;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  activate(): Result<void, DomainError> {
    if (this.props.active) {
      return Result.fail(new ConflictError("Product já está ativo"));
    }
    this.props.active = true;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get sku(): string | undefined {
    return this.props.sku;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get active(): boolean {
    return this.props.active;
  }

  get ncm(): string | undefined {
    return this.props.ncm;
  }

  get cfop(): string | undefined {
    return this.props.cfop;
  }

  get unit(): string | undefined {
    return this.props.unit;
  }

  get weightKg(): number | undefined {
    return this.props.weightKg;
  }

  get lengthCm(): number | undefined {
    return this.props.lengthCm;
  }

  get widthCm(): number | undefined {
    return this.props.widthCm;
  }

  get heightCm(): number | undefined {
    return this.props.heightCm;
  }

  get parentProductId(): UniqueEntityId | undefined {
    return this.props.parentProductId;
  }

  get variantLabel(): string | undefined {
    return this.props.variantLabel;
  }

  get externalId(): string | undefined {
    return this.props.externalId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
