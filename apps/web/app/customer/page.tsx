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
import { StatusDonut } from "@/components/status-donut";

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

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}

      <section className="mb-9">
        <h2 className={SECTION_TITLE_CLASS}>Parties</h2>

        {!loading && parties.length > 0 && (
          <div className="mb-5 max-w-[380px]">
            <StatusDonut
              title="Parties por tipo"
              data={[
                { label: "Pessoa", value: parties.filter((p) => p.partyType === "person").length, color: "var(--nov-b500)" },
                { label: "Organização Externa", value: parties.filter((p) => p.partyType === "external_organization").length, color: "var(--nov-s400)" },
              ]}
            />
          </div>
        )}

        <form onSubmit={handleCreateParty} className="mb-4 flex flex-wrap gap-2">
          <Select value={partyType} onChange={(e) => setPartyType(e.target.value as Party["partyType"])}>
            <option value="person">Pessoa</option>
            <option value="external_organization">Organização Externa</option>
          </Select>
          <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
          <Input placeholder="Documento (opcional)" value={document} onChange={(e) => setDocument(e.target.value)} />
          <Button type="submit" icon={<UserPlus size={15} />}>
            Nova Party
          </Button>
        </form>

        {!loading && parties.length === 0 && <EmptyState message="Nenhuma Party ainda." />}

        <div className="flex flex-col gap-2.5">
          {parties.map((party) => (
            <Card key={party.id} padding={16}>
              <div className="mb-1 font-mono text-[11px] text-nov-s500">{party.id}</div>
              <div className="mb-1 text-sm font-semibold text-nov-s100">{party.name}</div>
              {party.document && <div className="mb-1.5 text-xs text-nov-s400">{party.document}</div>}
              <Tag tone={party.partyType === "person" ? "accent" : "neutral"}>{party.partyType === "person" ? "Pessoa" : "Organização Externa"}</Tag>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className={SECTION_TITLE_CLASS}>Relationships</h2>
        <form onSubmit={handleCreateRelationship} className="mb-4 flex flex-wrap gap-2">
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

        <div className="flex flex-col gap-2.5">
          {relationships.map((relationship) => (
            <Card key={relationship.id} padding={16} className="flex items-center justify-between">
              <div className="text-sm text-nov-s200">
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

const SECTION_TITLE_CLASS = "mb-3.5 text-sm font-bold tracking-[-0.01em] text-nov-s200";
