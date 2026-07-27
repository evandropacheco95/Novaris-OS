"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, saveSession } from "@/lib/api";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input } from "@/components/input";

/**
 * Tela de login, elevada (`ENG-0147`) com a paleta/tipografia real do
 * brandkit da NOVARIS (`NOVARIS_Brand_Identity_v1.0.html`) — fundo `--nov-bg`,
 * acento `--nov-b600`, wordmark em `--ff-display` (Orbitron), moldura de
 * cantos ("bracket corners") como no topo de toda peça do brandkit. Migrado
 * para Tailwind em `ENG-0157`.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await login(email, password);
      saveSession(response);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{ background: "radial-gradient(circle at 30% 20%, var(--nov-bg3), var(--nov-bg))" }}
    >
      <div className="nov-animate-in relative w-[380px]">
        <div className="absolute -left-3 -top-3 h-3.5 w-3.5 border-l-2 border-t-2 border-nov-b600" />
        <div className="absolute -bottom-3 -right-3 h-3.5 w-3.5 border-b-2 border-r-2 border-nov-b600" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-nov-lg border border-nov-border bg-gradient-to-b from-nov-surface2 to-nov-surface p-11 shadow-nov-lg">
          <div className="mb-1 flex items-center gap-3">
            <div className="h-[34px] w-[34px] shrink-0 rounded-[9px] bg-gradient-to-br from-nov-b400 to-nov-b700 shadow-[0_0_20px_-2px_var(--nov-bglow)]" />
            <h1 className="m-0 font-nov-display text-[22px] tracking-[0.1em] text-nov-s50">NOVARIS</h1>
          </div>

          <div>
            <Tag>Intelligent Operating Platform</Tag>
          </div>

          <p className="mt-1 mb-0 text-[13px] text-nov-s400">Entrar na plataforma</p>

          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="m-0 text-[13px] text-nov-danger">{error}</p>}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
