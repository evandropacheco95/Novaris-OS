import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import {
  createPartyRepository,
  createRelationshipRepository,
  CreatePartyHandler,
  CreateRelationshipHandler,
} from "@novaris/customer";
import { PostgresPartySearch } from "@novaris/search";
import { AuthModule } from "../auth/auth.module.js";
import { PartyController } from "./party.controller.js";
import { RelationshipController } from "./relationship.controller.js";

const PARTY_REPOSITORY = "PARTY_REPOSITORY";
const RELATIONSHIP_REPOSITORY = "RELATIONSHIP_REPOSITORY";

/**
 * CustomerModule — Composition Root do Customer Domain dentro da API
 * (`ENG-0125`). Mesmo padrão de `SalesModule`: único lugar onde as
 * implementações concretas de Infrastructure são instanciadas e conectadas
 * aos Handlers da Application Layer.
 */
@Module({
  imports: [AuthModule],
  controllers: [PartyController, RelationshipController],
  providers: [
    {
      provide: PARTY_REPOSITORY,
      useFactory: () => createPartyRepository(prisma),
    },
    {
      provide: RELATIONSHIP_REPOSITORY,
      useFactory: () => createRelationshipRepository(prisma),
    },
    {
      provide: CreatePartyHandler,
      useFactory: (repository: ReturnType<typeof createPartyRepository>) => new CreatePartyHandler(repository),
      inject: [PARTY_REPOSITORY],
    },
    {
      provide: CreateRelationshipHandler,
      useFactory: (repository: ReturnType<typeof createRelationshipRepository>) => new CreateRelationshipHandler(repository),
      inject: [RELATIONSHIP_REPOSITORY],
    },
    {
      provide: "SearchIndex",
      useFactory: () => new PostgresPartySearch(prisma),
    },
    {
      provide: "PartyRepository",
      useExisting: PARTY_REPOSITORY,
    },
    {
      provide: "RelationshipRepository",
      useExisting: RELATIONSHIP_REPOSITORY,
    },
  ],
  // `CreatePartyHandler` exportado para `SalesModule` (`ADR-0042`,
  // `ConvertLeadHandler`) — mesma lição de `ENG-0136` (`PermissionGuard`):
  // um Handler referenciado por outro módulo precisa ser exportado
  // explicitamente, não basta ele existir como provider aqui.
  exports: [CreatePartyHandler],
})
export class CustomerModule {}
