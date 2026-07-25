# storage

## Objetivo

Alocação e controle de uso de armazenamento por organização.

## Fase

Fase D — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

🚧 `CONTRACT.md` ainda não escrito nesta missão — ver [identity/CONTRACT.md](../identity/CONTRACT.md), [event-bus/CONTRACT.md](../event-bus/CONTRACT.md) ou [audit/CONTRACT.md](../audit/CONTRACT.md) como exemplo de padrão a seguir.

## Dependências

Organizations

## Eventos

🚧 TODO — nenhum evento deste módulo foi nomeado em documento oficial ainda.

## Status

🚧 Estrutura criada (Missão ARCH-001). **Nenhuma implementação de código** — decisão explícita (`ADR-0039`, `ENG-0140`), não uma lacuna esquecida: "controle de uso" pressupõe um limite/cota por organização, e nenhuma fonte (`Subscription`, `ADR-0031`) define esse limite ainda — implementar `storage` sem essa regra real seria inventar um número. `files/` (Fase D irmã) foi implementado real nesta mesma missão **sem depender de `storage`** — upload/download funcionam sem controle de cota. Retomar `storage` quando existir uma regra de negócio real de plano/limite.
