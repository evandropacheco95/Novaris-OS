# Performance Intelligence — Screens

> Nenhuma tela existe hoje em `apps/web/app/`. Rascunho baseado no master doc — a construir só depois que a inteligência de backend (Fases 01-11) estiver suficientemente definida (o próprio master doc pede explicitamente para não construir dashboard sobre backend instável, Fase 12).

1. **Command Center** — investimento total, conversões, valor de conversão, CPA, ROAS, variação, alertas críticos, top oportunidades, ações de maior prioridade. Filtro por Company / Conta / Período.
2. **Campanhas** — tabela com investimento, conversões, CPA, ROAS, tendência, sinais, recomendações; drill-down.
3. **Inteligência** — feed de insights por severidade (`CRITICAL/HIGH/MEDIUM/LOW`), cada um expansível em o que aconteceu, evidência, por que importa, causas possíveis, confiança, próximo passo.
4. **Recomendações** — estados `PENDING/APPROVED/SCHEDULED/EXECUTED/REJECTED`, com significado explícito de cada ação.
5. **Search Intelligence** — top termos, candidatos a waste, candidatos a negativação, candidatos a expansão, termos de alta intenção, termos a investigar.
6. **Histórico de Ações** — timeline completa `Detecção → Análise → Diagnóstico → Recomendação → Aprovação → Execução → Medição → Aprendizado`.

Estados de sistema explícitos em toda a interface (nunca simular saúde do sistema): `NOT_CONNECTED, NO_DATA, SYNC_REQUIRED, SYNCING, SYNC_FAILED, ANALYSIS_PENDING, INSUFFICIENT_DATA, AI_UNAVAILABLE, ERROR`.
