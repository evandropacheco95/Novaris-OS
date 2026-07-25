/** CreateProjectCommand — Application Layer, Project Domain. Mesmo padrão de `CreatePartyCommand` (Customer). */
export interface CreateProjectCommandInput {
  readonly organizationId: string;
  readonly name: string;
}

export class CreateProjectCommand {
  readonly organizationId: string;
  readonly name: string;

  constructor(input: CreateProjectCommandInput) {
    this.organizationId = input.organizationId;
    this.name = input.name;
    Object.freeze(this);
  }
}
