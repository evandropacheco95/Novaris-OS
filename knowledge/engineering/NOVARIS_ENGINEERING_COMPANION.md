# NOVARIS Engineering Companion

Versão: 1.0.0

Status: 🟢 Oficial — documento pedagógico, **sem autoridade normativa**

Audiência: CTO/fundador da NOVARIS, futuros colaboradores não familiarizados com a terminologia técnica, agentes de IA que precisem explicar (não apenas aplicar) as decisões já tomadas.

---

## Objetivo

Este é o "livro do professor" da engenharia da NOVARIS: explica, em português simples, com analogias e exemplos, **por que** cada parte do [NOVARIS Engineering Handbook](NOVARIS_ENGINEERING_HANDBOOK.md) existe — não apenas o que ela diz. Este documento **nunca é fonte de autoridade**: onde ele divergir do Handbook, de `CONSTITUTION.md`, de `PROJECT_RULES.md` ou de qualquer ADR, esses documentos prevalecem, e este arquivo deve ser corrigido para bater com eles — nunca o contrário. Mesma disciplina já aplicada pelo próprio Handbook em relação às suas fontes primárias.

Este documento aplica a convenção de "Termo Técnico" recém-formalizada em `PROJECT_RULES.md § Regras de Documentação` (Emenda 31): a primeira aparição de um termo técnico importante vem acompanhada de um bloco explicativo; nas aparições seguintes, o termo é usado livremente. Por legibilidade, nem todo acrônimo do Handbook recebe o bloco completo — só os conceitos fundamentais que sustentam o resto; siglas de processo (ARG, DMV, ACR, PR, CI) recebem uma tradução curta entre parênteses na primeira menção.

---

## Como usar este Companion

Cada seção abaixo espelha, na mesma ordem, uma seção do Handbook. Leia o Handbook primeiro (ou em paralelo) — este documento não substitui a leitura, ele explica o que ela significa.

---

## 1. Filosofia de Engenharia

O Handbook lista 8 nomes técnicos de uma vez: Clean Architecture, DDD, SOLID, Ports & Adapters, Event-Driven, Modular Monolith Ready, Microservice Ready, AI First Development. Os dois primeiros sustentam praticamente tudo o que vem depois.

> **Termo Técnico: `Clean Architecture`**
> **Em português**: Arquitetura Limpa.
> **O que significa**: uma forma de organizar o código em camadas, onde as camadas internas (as regras de negócio) nunca precisam saber nada sobre as camadas externas (banco de dados, APIs, frameworks). A dependência sempre aponta "para dentro".
> **Na NOVARIS**: é por isso que, em toda a Contracts Layer do Sales Domain construída nesta engenharia, nenhum arquivo de Contract importa nada de `infrastructure/` ou de um banco de dados — só o contrário seria permitido.

> **Termo Técnico: `Domain-Driven Design (DDD)`**
> **Em português**: Design Orientado ao Domínio.
> **O que significa**: em vez de desenhar o sistema a partir do banco de dados ou da tela, você desenha a partir do **vocabulário real do negócio** — os nomes que as pessoas da empresa já usam (Oportunidade, Proposta, Pipeline) viram os nomes das classes no código, exatamente iguais.
> **Na NOVARIS**: o `Sales Domain` foi construído assim — `Opportunity`, `Proposal`, `Pipeline`, `Stage` são nomes que já existiam em `DOMAIN_MODEL.md` antes de qualquer linha de código, não inventados durante a implementação.

Por que isso importa para você: sem essas duas ideias, qualquer app pode virar "uma bagunça que funciona" em pouco tempo — regra de negócio misturada com chamada de banco de dados, tudo dependendo de tudo. Clean Architecture + DDD são a razão pela qual, mesmo depois de dezenas de missões de engenharia neste repositório, o Sales Domain continua organizado da mesma forma do primeiro dia.

## 2. Estrutura do Repositório

A árvore de pastas (`services/`, `packages/`, `knowledge/`, `adr/`, etc.) não é aleatória — cada pasta tem um dono e uma regra sobre o que pode entrar nela. `services/domains/` é onde vive cada área de negócio (Sales, Customer...); `services/kernel/` é o que é compartilhado por todas elas (Identity, Organization); `knowledge/` é onde a empresa guarda o que já decidiu, para nunca decidir a mesma coisa duas vezes.

## 3. Fluxo Oficial de Desenvolvimento

11 fases obrigatórias antes de qualquer código ser escrito — a ideia central é: **entender e planejar sempre vêm antes de implementar**. É o motivo pelo qual, em toda missão desta engenharia, primeiro se lê a documentação e os ADRs existentes ("Verify Before Reimplementing"), depois se pede aprovação explícita, e só então se escreve código.

## 4. Tipos de Missão

> **Termo Técnico: `Architecture Decision Record (ADR)`**
> **Em português**: Registro de Decisão Arquitetural.
> **O que significa**: um documento curto que registra uma decisão importante e difícil de reverter — o quê foi decidido, por quê, quais alternativas foram consideradas e descartadas, e quais as consequências. Uma vez aceito, só pode ser mudado por outro ADR, nunca silenciosamente.
> **Na NOVARIS**: cada vez que esta engenharia decidiu algo como "`Queue` não pertence a nenhum domínio" ou "`CRM` não é um Bounded Context", isso virou um ADR (`ADR-0012`, `ADR-0011`) — é assim que a plataforma não esquece por que decidiu o que decidiu.

Os prefixos (`ADR-`, `ADM-`, `ENS-`, `ENG-`) são só uma forma de saber, pelo nome da missão, que tipo de trabalho ela é — uma decisão pontual, um índice de decisões, um padrão de como fazer algo, ou uma implementação real.

## 5. Processo de Aprovação

A regra mais simples e mais importante do Handbook: **nenhuma missão começa a próxima sozinha**. Silêncio não é aprovação. Isso existe para uma razão prática — evitar que um agente de IA (ou um colaborador apressado) continue construindo em cima de uma decisão que o CTO ainda não confirmou.

## 6. Governança Arquitetural

A ordem de quem manda em quem: `CONSTITUTION.md` está no topo, depois `PROJECT_RULES.md`, depois os ADRs, depois a documentação de referência. Se dois documentos discordarem, o de cima sempre vence. É a mesma lógica de uma constituição de um país: leis não podem contrariar a constituição.

## 7. Padrões Obrigatórios

> **Termo Técnico: `Aggregate`**
> **Em português**: Agregado.
> **O que significa**: um grupo de objetos relacionados que sempre deve ser tratado como uma unidade só, com uma "porta de entrada" única — nenhuma parte de dentro pode ser alterada por fora sem passar por essa porta.
> **Na NOVARIS**: `Opportunity` é um Aggregate — ele contém `Proposal`s dentro dele, e a única forma de aprovar uma `Proposal` é chamando um método na própria `Opportunity` (`approveProposal()`), nunca mexendo direto na `Proposal`.

Os "ENS" (Engineering Standards) são o manual de instruções de como construir um Aggregate, ou um Domain Service, corretamente, sempre da mesma forma, não importa qual domínio.

## 8. Fluxo para Criação de Novos Domínios

Esta é a receita, passo a passo, testada primeiro no domínio Identity e depois repetida (com adaptações) no Sales Domain ao longo desta sessão: primeiro o vocabulário (quais palavras existem), depois o desenho técnico completo (sem código ainda), depois a implementação em camadas (Value Objects → Aggregates → Repository Contracts → Domain Services), sempre com um "congelamento" formal antes de seguir para a próxima etapa maior.

## 9. Fluxo para Implementação

O detalhe técnico de como um Aggregate deve nascer no código: construtor privado (ninguém cria um `Opportunity` chamando `new` diretamente), métodos de fábrica (`create`/`reconstitute`) que sempre devolvem um resultado de sucesso-ou-erro, nunca uma exceção solta.

## 10. Fluxo para Validação

> **Termo Técnico: `Architecture Review Gate (ARG)`**
> **Em português**: Portão de Revisão Arquitetural.
> **O que significa**: uma checklist binária — PASS ou FAIL, nunca "mais ou menos" — que toda missão de implementação precisa passar antes do relatório final.
> **Na NOVARIS**: foi exatamente o que aconteceu em `ENG-0117` (Sales Contracts Architecture Review Gate V2) — 15 critérios, todos avaliados um a um, resultado PASS 15/15, só depois disso um Freeze foi autorizado.

## 11. Processo de Merge

O checklist de Pull Request (revisão de código antes de integrar ao repositório principal) — ainda tem pontos em aberto (quantas aprovações são necessárias, se testes automatizados bloqueiam o merge sozinhos), porque ninguém decidiu isso formalmente ainda.

## 12. Processo de Release

O que precisa ser verdade antes de lançar uma nova versão para uso real — versionamento segue o padrão internacional "Keep a Changelog + SemVer" (números de versão que comunicam se a mudança é pequena, média ou quebra compatibilidade).

## 13. Roadmap Macro da Plataforma

As 12 fases planejadas da NOVARIS, da Foundation (already concluída) até Developer Platform. O Sales Domain que ocupou a maior parte desta sessão de engenharia faz parte da fase "Core Platform".

## 14. Responsabilidades dos Agentes de IA

Cinco papéis diferentes que um agente de IA pode assumir — Architect AI propõe, mas não aprova sozinho; Engineer AI implementa, mas nunca sem um plano já aprovado; Reviewer AI aponta problemas, mas não aprova sozinho; QA AI testa; Documentation AI mantém tudo atualizado, mas nunca inventa uma regra de negócio nova. Nenhum papel de IA tem autoridade final sozinho — a aprovação final é sempre humana (o CTO).

---

## Por que isso tudo importa

O ponto central de todo esse aparato — Constituição, Handbook, ADRs, Standards, Missões — não é burocracia pela burocracia. É a aplicação prática do princípio **Knowledge Driven Engineering**, formalizado no Artigo 20 da Constituição: toda decisão de engenharia produz conhecimento, e esse conhecimento vira um ativo permanente da plataforma, nunca dependente da memória de uma única pessoa. Cada vez que este Companion cita um ADR ou uma missão real (`ADR-0012`, `ENG-0117`), está mostrando o Ciclo do Conhecimento em ação: uma decisão virou execução, a execução virou resultado, o resultado virou conhecimento documentado, pronto para ser reaprendido por qualquer pessoa ou agente no futuro.

---

## Relação com Outros Módulos

- [NOVARIS_ENGINEERING_HANDBOOK.md](NOVARIS_ENGINEERING_HANDBOOK.md) — fonte autoritativa que este documento explica, nunca substitui
- [knowledge/core/CONSTITUTION.md](../core/CONSTITUTION.md) — princípios permanentes, incluindo Knowledge Driven Engineering (Artigo 20, emendado por [ADR-0022](../../adr/ADR-0022-constitution-knowledge-cycle-amendment.md))
- [knowledge/core/manifesto.md](../core/manifesto.md) — a convicção por trás dos princípios explicados aqui
- [PROJECT_RULES.md § Regras de Documentação](../../PROJECT_RULES.md) — origem da convenção "Termo Técnico" aplicada neste documento (Emenda 31)
- [standards/](standards/README.md) — os ENS citados na § 7/8/9 acima, em detalhe técnico completo

## Status

🟢 Oficial (v1.0.0), sem autoridade normativa. Nenhum código, ADR, regra de negócio ou documento canônico alterado por esta missão — apenas explicado.
