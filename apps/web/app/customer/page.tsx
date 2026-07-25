"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Link2 } from "lucide-react";
import {
  createParty,
  createRelationship,
  getToken,
  listParties,
  listRelationships,
  type Party,
  type Relationship,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const RELATIONSHIP_TYPES: Relationship["type"][] = ["cliente", "fornecedor", "parceiro", "prospect", "investidor", "colaborador"];

/**
 * Tela de Customer — terceira tela real da NOVARIS (`ENG-0127`), elevada em
 * `ENG-0147`. Lista Parties e Relationships da Organization do usuário
 * autenticado, permite criar ambos.
 */
export default function CustomerPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [partyType, setPartyType] = useState<Party["partyType"]>("person");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");

  const [partyIdA, setPartyIdA] = useState("");
  const [partyIdB, setPartyIdB] = useState("");
  const [relType, setRelType] = useState<Relationship["type"]>("cliente");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    void refresh();
  }, []);

  async function refresh(): Promise<void> {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([listParties(), listRelationships()]);
      setParties(p);
      setRelationships(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateParty(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createParty(partyType, name, document || undefined);
      setName("");
      setDocument("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Party");
    }
  }

  async function handleCreateRelationship(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createRelationship(partyIdA, partyIdB, relType);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Relationship");
    }
  }

  function partyName(id: string): string {
    return parties.find((p) => p.id === id)?.name ?? id;
  }

  return (
    <DashboardShell title="Relationship">
      <PageHeader title="Relationship" description="Parties e vínculos entre elas." />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <section style={{ marginBottom: 36 }}>
        <h2 style={sectionTitleStyle}>Parties</h2>
        <form onSubmit={handleCreateParty} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Select value={partyType} onChange={(e) => setPartyType(e.target.value as Party["partyType"])}>
            <option value="person">Pessoa</option>
            <option value="external_organization">Organização Externa</option>
          </Select>
          <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
          <Input placeholder="Documento (opcional)" value={document} onChange={(e) => setDocument(e.target.value)} />
          <Button type="submit" icon={<UserPlus size={15} />}>
            Nova Party
          </Button>
        </form>

        {!loading && parties.length === 0 && <EmptyState message="Nenhuma Party ainda." />}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {parties.map((party) => (
            <Card key={party.id} padding={16}>
              <div style={{ fontSize: 11, color: "var(--nov-s500)", fontFamily: "monospace", marginBottom: 4 }}>{party.id}</div>
              <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600, marginBottom: 4 }}>{party.name}</div>
              {party.document && <div style={{ fontSize: 12, color: "var(--nov-s400)", marginBottom: 6 }}>{party.document}</div>}
              <Tag tone={party.partyType === "person" ? "accent" : "neutral"}>
                {party.partyType === "person" ? "Pessoa" : "Organização Externa"}
              </Tag>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 style={sectionTitleStyle}>Relationships</h2>
        <form onSubmit={handleCreateRelationship} style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Select value={partyIdA} onChange={(e) => setPartyIdA(e.target.value)} required>
            <option value="">Party A</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select value={partyIdB} onChange={(e) => setPartyIdB(e.target.value)} required>
            <option value="">Party B</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Select value={relType} onChange={(e) => setRelType(e.target.value as Relationship["type"])}>
            {RELATIONSHIP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Button type="submit" icon={<Link2 size={15} />}>
            Novo Relationship
          </Button>
        </form>

        {!loading && relationships.length === 0 && <EmptyState message="Nenhum Relationship ainda." />}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {relationships.map((relationship) => (
            <Card key={relationship.id} padding={16} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, color: "var(--nov-s200)" }}>
                {partyName(relationship.partyIdA)} ↔ {partyName(relationship.partyIdB)}
              </div>
              <Tag>{relationship.type}</Tag>
            </Card>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

const sectionTitleStyle = { fontSize: 14, fontWeight: 700, color: "var(--nov-s200)", marginBottom: 14, letterSpacing: "-0.01em" };
