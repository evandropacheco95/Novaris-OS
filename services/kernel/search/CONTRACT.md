# Contrato de Serviço — search

## Objetivo

Indexação e busca sobre objetos da plataforma. Implementado real em `ENG-0140`/`ADR-0039` — escopo restrito a busca direta (sem índice próprio) sobre `Party` (Customer Domain).

## Interface Pública

```typescript
interface SearchResult {
  readonly entityType: string;
  readonly entityId: string;
  readonly label: string;
}

interface SearchIndex {
  search(organizationId: string, query: string): Promise<SearchResult[]>;
}
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `search` | `organizationId: string`, `query: string` | `SearchResult[]` | Query em branco devolve `[]` sem consultar o banco; busca por `contains`/`insensitive` sobre `parties.name`, escopada por `organizationId` |

## Erros

Não aplicável a quem chama — falha de consulta propaga como exceção nativa do Prisma (nenhum tratamento especial decidido nesta missão; mesmo comportamento de qualquer Repository real desta engenharia).

## Eventos Emitidos

Nenhum.

## Dependências

**Correção (`ENG-0140`)**: a versão anterior citava `Event Bus` como dependência (indexação reativa a eventos). Implementação real depende só de `Database` — busca é direta (consulta síncrona ao Postgres), sem índice próprio mantido por eventos. Indexação reativa via Event Bus permanece decisão futura.

## Object Specification

Não aplicável — infraestrutura transversal; `Party` (a única entidade coberta) tem sua própria Object Specification em `Customer Domain`.

## Status

🟡 Parcial, real (`ENG-0140`, `ADR-0039`). `SearchIndex` (Port) + `PostgresPartySearch` (Infrastructure, `ILIKE` real via Prisma) implementados e testados (5 testes de integração real contra Postgres). Exposto via `GET /parties/search?q=` (`apps/api`, `CustomerModule`). **Só `Party`** — estender a outras entidades (Organization, Project, etc.) é decisão futura, não bloqueada por esta implementação, mas não fabricada sem necessidade real.
