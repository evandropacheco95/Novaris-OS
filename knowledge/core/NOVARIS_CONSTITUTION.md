# NOVARIS CONSTITUTION

Version: 1.0.0

Status: OFFICIAL

Authority: MAXIMUM

Classification: Immutable

------------------------------------------------------------

PREAMBLE

A NOVARIS é uma Enterprise Operating System (EOS).

Toda decisão de arquitetura, desenvolvimento, documentação, segurança,
inteligência artificial e operação deverá respeitar esta Constituição.

Nenhum documento possui autoridade superior.

Em caso de conflito entre documentos, esta Constituição prevalece.

------------------------------------------------------------

ARTICLE I

THE PURPOSE

A plataforma existe para construir sistemas empresariais escaláveis,
seguros, inteligentes e configuráveis.

Toda decisão deverá favorecer:

• Simplicidade
• Escalabilidade
• Segurança
• Reutilização
• Observabilidade
• Automação
• Inteligência Artificial
• Qualidade

------------------------------------------------------------

ARTICLE II

THE SOURCE OF TRUTH

A ordem oficial de autoridade é:

1. NOVARIS_CONSTITUTION.md

2. NES

3. ADR

4. Object Specifications

5. Specifications

6. Architecture

7. Código

O código nunca possui prioridade maior que a documentação.

------------------------------------------------------------

ARTICLE III

MULTI-TENANCY

Toda informação pertence obrigatoriamente a uma Organization.

É proibido existir qualquer dado empresarial sem organization_id,
exceto objetos globais explicitamente definidos pelo Kernel.

Toda consulta deverá respeitar isolamento lógico.

Toda política RLS deverá impedir acesso entre organizações.

------------------------------------------------------------

ARTICLE IV

DOMAIN DRIVEN DESIGN

Toda implementação pertence obrigatoriamente a um domínio.

Nenhum domínio pode acessar diretamente o banco de outro domínio.

Toda comunicação entre domínios ocorrerá por:

• APIs
• Eventos
• Interfaces públicas

------------------------------------------------------------

ARTICLE V

BUSINESS OBJECTS

Toda funcionalidade nasce de um Business Object.

É proibido criar tabelas, APIs ou telas antes da existência da
Object Specification correspondente.

------------------------------------------------------------

ARTICLE VI

SPECIFICATIONS

Nenhuma funcionalidade poderá ser implementada sem Specification.

Toda Specification deverá conter:

• Objetivo
• Escopo
• Regras de negócio
• Fluxos
• Critérios de aceite
• Dependências
• Plano de testes

------------------------------------------------------------

ARTICLE VII

ARCHITECTURE DECISIONS

Toda decisão estrutural deverá gerar um ADR.

Mudanças de arquitetura sem ADR são proibidas.

------------------------------------------------------------

ARTICLE VIII

DATABASE

Toda tabela deverá possuir:

• UUID
• created_at
• updated_at
• deleted_at (quando aplicável)
• audit trail
• índices
• constraints
• documentação

Quando aplicável, também:

• organization_id
• created_by
• updated_by

------------------------------------------------------------

ARTICLE IX

ROW LEVEL SECURITY

Toda tabela multiempresa deverá utilizar RLS.

Nenhuma consulta poderá ignorar políticas de segurança.

------------------------------------------------------------

ARTICLE X

API DESIGN

Toda API deverá possuir:

• autenticação
• autorização
• versionamento
• tratamento de erros
• documentação
• auditoria
• logs

------------------------------------------------------------

ARTICLE XI

EVENT DRIVEN ARCHITECTURE

Toda alteração relevante deverá gerar eventos.

Exemplos:

OrganizationCreated

UserInvited

OpportunityWon

WorkflowExecuted

InvoicePaid

AgentFinished

------------------------------------------------------------

ARTICLE XII

AI

Toda IA obrigatoriamente deverá:

Ler contexto.

Validar permissões.

Registrar execução.

Registrar decisões.

Registrar ferramentas utilizadas.

Registrar memória utilizada.

Nenhuma IA poderá acessar dados diretamente.

Toda IA utiliza AI Runtime.

------------------------------------------------------------

ARTICLE XIII

AUTOMATION

Toda automação deverá:

Possuir responsável.

Possuir gatilho.

Possuir condições.

Possuir logs.

Possuir rollback quando aplicável.

------------------------------------------------------------

ARTICLE XIV

OBSERVABILITY

Todo componente deverá gerar:

Logs

Eventos

Métricas

Tracing

Health Check

------------------------------------------------------------

ARTICLE XV

TESTS

Nenhuma implementação será considerada pronta sem:

Testes unitários.

Testes de integração.

Validação funcional.

Critérios de aceite atendidos.

------------------------------------------------------------

ARTICLE XVI

DOCUMENTATION

Toda alteração deverá atualizar:

Object Specification

Specification

Changelog

ADR (quando necessário)

Knowledge Base

------------------------------------------------------------

ARTICLE XVII

CODE QUALITY

É proibido:

Duplicação desnecessária.

Código morto.

Dependências circulares.

Violação do SOLID.

Violação da arquitetura oficial.

------------------------------------------------------------

ARTICLE XVIII

SECURITY

Toda implementação deverá seguir:

Princípio do menor privilégio.

Validação de entrada.

Criptografia de dados sensíveis.

Segurança por padrão.

Auditoria obrigatória.

------------------------------------------------------------

ARTICLE XIX

VERSIONING

Toda mudança deverá gerar:

Versionamento.

Registro.

Histórico.

Rollback.

------------------------------------------------------------

ARTICLE XX

DEFINITION OF DONE

Uma implementação somente estará concluída quando:

✓ Código aprovado

✓ Testes executados

✓ Documentação atualizada

✓ ADR atualizado (quando necessário)

✓ Specification atualizada

✓ Object Specification atualizada

✓ Changelog atualizado

✓ Logs funcionando

✓ Eventos funcionando

✓ Observabilidade validada

------------------------------------------------------------

ARTICLE XXI

THE ENGINEERING OATH

Todo engenheiro humano ou agente de IA deverá seguir esta Constituição.

Nenhuma implementação poderá violar qualquer artigo aqui definido.

Quando houver dúvida, prevalecerão:

Segurança.

Consistência.

Escalabilidade.

Documentação.

------------------------------------------------------------

END OF CONSTITUTION

---

## Relação com Outros Módulos

*(Seção adicionada na integração ao repositório. Não faz parte do texto original recebido — o preâmbulo e os 21 artigos acima permanecem exatamente como fornecidos.)*

⚠️ **RESOLVIDO por [ADR-0008](../../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5, Foundation Freeze)**: este documento e [knowledge/core/CONSTITUTION.md](CONSTITUTION.md) (23 Artigos) coexistiram sem se citar, ambos se autodeclarando a Constituição suprema da NOVARIS. O usuário/CTO confirmou `CONSTITUTION.md` como a única autoridade constitucional ativa da plataforma. Este documento permanece íntegro como registro histórico — nenhum artigo foi alterado — mas não é mais a fonte de governança vigente. Toda referência vinculante deve apontar para `CONSTITUTION.md`.

## Status

🟡 Histórico (v1.0.0) — salvo verbatim, não alterado. Redirecionado para [CONSTITUTION.md](CONSTITUTION.md) como fonte constitucional ativa por [ADR-0008](../../adr/ADR-0008-foundation-freeze.md).
