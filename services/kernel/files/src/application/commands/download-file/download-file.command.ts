export interface DownloadFileCommandInput {
  readonly organizationId: string;
  readonly fileId: string;
}

export class DownloadFileCommand {
  readonly organizationId: string;
  readonly fileId: string;

  constructor(input: DownloadFileCommandInput) {
    this.organizationId = input.organizationId;
    this.fileId = input.fileId;
    Object.freeze(this);
  }
}
