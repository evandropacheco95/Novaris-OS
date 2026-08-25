"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { askTextToSql, useCurrentUser } from "@/lib/api";
import { Button } from "./button";
import { Input } from "./input";
import { Card } from "./card";

interface ConversationEntry {
  question: string;
  answer?: string;
  sql?: string | null;
  error?: string;
}

/**
 * AiAssistant — primeira interface real para `POST /ai/text-to-sql`
 * (`ADR-0054`, `ENG-0170`), piloto de `FeatureGuard` (`ADR-0056`, `ENG-0172`).
 * Até este componente, a rota existia sem nenhuma tela consumindo — o toggle
 * em `/settings` ligava a feature, mas nada no produto deixava o usuário
 * efetivamente perguntar algo. Atalho Ctrl+K/Cmd+K, inspirado no assistente
 * do CRM Allbinox usado como referência.
 *
 * Backend ainda é um adapter estrutural (`ConsoleTextToSqlRuntime`) — toda
 * resposta vem com `loggedOnly: true` e `sql: null` até uma credencial de IA
 * real existir. Este componente não esconde isso: mostra a resposta (mesmo
 * sendo a mensagem estrutural) tal como o backend devolve.
 */
export function AiAssistant() {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ConversationEntry[]>([]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) {
    return null;
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setQuestion("");
    try {
      const result = await askTextToSql(trimmed);
      setHistory((prev) => [...prev, { question: trimmed, answer: result.answer, sql: result.sql }]);
    } catch (err) {
      setHistory((prev) => [...prev, { question: trimmed, error: err instanceof Error ? err.message : "Falha ao consultar o assistente" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-nov-border2 bg-gradient-to-b from-nov-b500 to-nov-b600 px-4 py-3 text-[13px] font-semibold text-white shadow-nov-lg transition-[filter,transform] duration-nov-fast hover:brightness-110 active:scale-[0.98]"
      >
        <Sparkles size={16} />
        Assistente
        <span className="rounded-nov border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10.5px] font-medium tracking-[0.03em]">Ctrl+K</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh]" onClick={() => setOpen(false)}>
          <Card
            padding={0}
            className="flex max-h-[70vh] w-full max-w-[560px] flex-col overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-nov-border px-5 py-3.5">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-nov-s50">
                <Sparkles size={15} className="text-nov-b400" />
                Assistente NOVARIS
              </div>
              <button onClick={() => setOpen(false)} className="text-nov-s500 hover:text-nov-s200">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {history.length === 0 && (
                <p className="text-[13px] text-nov-s500">
                  Pergunte algo sobre seus dados em linguagem natural (`ai-runtime.text-to-sql`, `ADR-0054`).
                </p>
              )}
              <div className="flex flex-col gap-4">
                {history.map((entry, index) => (
                  <div key={index} className="flex flex-col gap-1.5">
                    <div className="self-end rounded-nov bg-nov-bsoft px-3 py-2 text-[13px] text-nov-s100">{entry.question}</div>
                    {entry.error ? (
                      <div className="rounded-nov border border-nov-danger-soft bg-nov-danger-soft px-3 py-2 text-[13px] text-nov-danger">
                        {entry.error}
                        {entry.error.includes("não está habilitada") && (
                          <span className="block text-xs opacity-80">Ative em Empresa → Features.</span>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-nov border border-nov-border2 bg-nov-bg2 px-3 py-2 text-[13px] text-nov-s200">{entry.answer}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-nov-border px-4 py-3">
              <Input
                autoFocus
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pergunte em linguagem natural..."
                className="w-full"
              />
              <Button type="submit" size="sm" loading={loading} disabled={!question.trim()}>
                Perguntar
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
