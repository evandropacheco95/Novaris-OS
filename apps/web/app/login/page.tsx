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
 * cantos ("bracket corners") como no topo de toda peça do brandkit.
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
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 30% 20%, var(--nov-bg3), var(--nov-bg))",
      }}
    >
      <div className="nov-animate-in" style={{ position: "relative", width: 380 }}>
        <div style={{ position: "absolute", top: -12, left: -12, width: 14, height: 14, borderLeft: "2px solid var(--nov-b600)", borderTop: "2px solid var(--nov-b600)" }} />
        <div style={{ position: "absolute", bottom: -12, right: -12, width: 14, height: 14, borderRight: "2px solid var(--nov-b600)", borderBottom: "2px solid var(--nov-b600)" }} />

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 44,
            background: "linear-gradient(180deg, var(--nov-surface2), var(--nov-surface))",
            border: "1px solid var(--nov-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "linear-gradient(135deg, var(--nov-b400), var(--nov-b700))",
                boxShadow: "0 0 20px -2px var(--nov-bglow)",
                flexShrink: 0,
              }}
            />
            <h1 style={{ fontFamily: "var(--ff-display)", fontSize: 22, letterSpacing: "0.1em", margin: 0, color: "var(--nov-s50)" }}>NOVARIS</h1>
          </div>

          <div>
            <Tag>Intelligent Operating Platform</Tag>
          </div>

          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--nov-s400)" }}>Entrar na plataforma</p>

          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p style={{ color: "var(--nov-danger)", fontSize: 13, margin: 0 }}>{error}</p>}

          <Button type="submit" loading={loading} style={{ marginTop: 8, width: "100%" }}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
