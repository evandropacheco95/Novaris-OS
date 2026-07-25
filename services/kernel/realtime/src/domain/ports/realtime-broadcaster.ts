/**
 * Port de Realtime (`ENGINEERING_PLAYBOOK.md § 9`) — comunicação em tempo
 * real. Deliberadamente framework-agnóstico: o transporte real (WebSocket
 * via `@nestjs/websockets`/`ws`) é um adapter que vive em `apps/api`, nunca
 * neste pacote (`ADR-0039`) — mesma disciplina de `logging`.
 *
 * Escopo desta missão: `broadcast` global — todo cliente conectado recebe
 * toda mensagem, com `channel` embutido no payload para o cliente filtrar.
 * Sem "rooms"/assinatura seletiva no servidor (exigiria `socket.io` em vez de
 * `ws` puro) — decisão de escopo mínimo, não uma limitação técnica de
 * `ws`/`socket.io` em si.
 */
export interface RealtimeBroadcaster {
  broadcast(channel: string, payload: unknown): void;
}
