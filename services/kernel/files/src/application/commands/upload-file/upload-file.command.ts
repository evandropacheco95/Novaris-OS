export interface UploadFileCommandInput {
  readonly organizationId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly content: Buffer;
}

export class UploadFileCommand {
  readonly organizationId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly content: Buffer;

  constructor(input: UploadFileCommandInput) {
    this.organizationId = input.organizationId;
    this.filename = input.filename;
    this.mimeType = input.mimeType;
    this.content = input.content;
    Object.freeze(this);
  }
}
