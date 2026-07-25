import { Result, UniqueEntityId, ValidationError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Party, type PartyType } from "../../../domain/aggregates/party/party.js";
import type { PartyRepository } from "../../../domain/repositories/party-repository.js";
import type { CreatePartyCommand } from "../../commands/create-party/create-party.command.js";

const VALID_PARTY_TYPES: readonly PartyType[] = ["person", "external_organization"];

/**
 * CreatePartyHandler — Application Layer, Customer Domain.
 *
 * Orquestra: `CreatePartyCommand` → validação de `partyType` (única lógica
 * própria do Handler, além da conversão `string` → `UniqueEntityId`, mesmo
 * padrão de `CreateOpportunityHandler`) → `Party.create()` →
 * `PartyRepository.save()` → `Result<Party, DomainError | InfrastructureError>`.
 *
 * **Bug real corrigido (`ENG-0125`)**: a primeira versão deste Handler
 * chamava `await this.partyRepository.save(party)` sem verificar o `Result`
 * devolvido — uma falha real de infraestrutura (confirmada: `party_type`
 * "external_organization" excedia `VARCHAR(20)`, achado e corrigido junto
 * nesta missão) era descartada silenciosamente, e o Handler devolvia
 * `Result.ok(party)` mesmo sem nada ter sido persistido. Diferente do
 * mesmo padrão em `CreateOpportunityHandler` (Sales), que só lê `findById()`
 * sem checar (justificado ali por `InMemoryOpportunityRepository` nunca
 * falhar) — aqui a Infrastructure é Prisma real desde o início, então o
 * `Result` de `save()` **precisa** ser verificado.
 */
export class CreatePartyHandler {
  constructor(private readonly partyRepository: PartyRepository) {}

  async execute(command: CreatePartyCommand): Promise<Result<Party, DomainError | InfrastructureError>> {
    if (!VALID_PARTY_TYPES.includes(command.partyType as PartyType)) {
      return Result.fail(new ValidationError(`"partyType" inválido: "${command.partyType}"`));
    }

    const createResult = Party.create({
      organizationId: new UniqueEntityId(command.organizationId),
      partyType: command.partyType as PartyType,
      name: command.name,
      document: command.document,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const party = createResult.getValue()!;
    const saveResult = await this.partyRepository.save(party);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(party);
  }
}
