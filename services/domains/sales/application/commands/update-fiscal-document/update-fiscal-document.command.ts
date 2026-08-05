/**
 * UpdateFiscalDocumentCommand — Application Layer, Sales Domain (`ENG-0169`).
 * `undefined` = não enviado, não mexer; `null` = remover o valor
 * explicitamente — mesma distinção de `UpdateFiscalLogisticsProfileCommand`.
 */
export interface UpdateFiscalDocumentCommandInput {
  readonly contractId: string;
  readonly fiscalDocumentNumber?: string | null;
  readonly fiscalDocumentAccessKey?: string | null;
  readonly fiscalDocumentIssuedAt?: Date | null;
}

export class UpdateFiscalDocumentCommand {
  readonly contractId: string;
  readonly fiscalDocumentNumber?: string | null;
  readonly fiscalDocumentAccessKey?: string | null;
  readonly fiscalDocumentIssuedAt?: Date | null;

  constructor(input: UpdateFiscalDocumentCommandInput) {
    this.contractId = input.contractId;
    this.fiscalDocumentNumber = input.fiscalDocumentNumber;
    this.fiscalDocumentAccessKey = input.fiscalDocumentAccessKey;
    this.fiscalDocumentIssuedAt = input.fiscalDocumentIssuedAt;
    Object.freeze(this);
  }
}
