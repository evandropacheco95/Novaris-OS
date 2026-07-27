"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { convertLead, createLead, getToken, listLeads, updateLeadStatus, type Lead, type LeadStatus } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  unqualified: "Não qualificado",
  converted: "Convertido",
};

const STATUS_TONE: Record<LeadStatus, "accent" | "success" | "danger" | "neutral"> = {
  new: "accent",
  contacted: "accent",
  qualified: "success",
  unqualified: "danger",
  converted: "success",
};

const UPDATABLE_STATUSES: Exclude<LeadStatus, "converted">[] = ["new", "contacted", "qualified", "unqualified"];

/**
 * Tela de Leads (`ADR-0042`, `ENG-0143`) — adaptada do Lead-to-Convert do
 * Salesforce, elevada visualmente em `ENG-0147`. Não é um 11º Business
 * Domain na sidebar — vive dentro de Sales, acessível a partir de
 * `/opportunities`.
 */
export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("");
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [partyType, setPartyType] = useState("person");
  const [createOpportunityToo, setCreateOpportunityToo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLeads(await listLeads());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createLead(name, email || undefined, phone || undefined, company || undefined, source || undefined);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setSource("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Lead");
    }
  }

  async function handleStatusChange(id: string, status: Exclude<LeadStatus, "converted">): Promise<void> {
    setError(null);
    try {
      await updateLeadStatus(id, status);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar status");
    }
  }

  async function handleConvert(id: string): Promise<void> {
    setError(null);
    try {
      await convertLead(id, partyType, createOpportunityToo);
      setConvertingId(null);
      setCreateOpportunityToo(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao converter Lead");
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader title="Leads" description="Contatos em qualificação, adaptado do Lead-to-Convert do Salesforce." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/opportunities")}>← Opportunities</Button>} />

      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap gap-2">
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="E-mail (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Telefone (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="Empresa (opcional)" value={company} onChange={(e) => setCompany(e.target.value)} />
        <Input placeholder="Origem (opcional)" value={source} onChange={(e) => setSource(e.target.value)} />
        <Button type="submit" icon={<UserPlus size={15} />}>
          Novo Lead
        </Button>
      </form>

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && leads.length === 0 && <EmptyState message="Nenhum Lead ainda." />}

      {!loading && leads.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          {(["new", "contacted", "qualified", "unqualified", "converted"] as const).map((status) => {
            const columnLeads = leads.filter((l) => l.status === status);
            return (
              <div key={status}>
                <div className="mb-3 flex items-center gap-2 px-0.5">
                  <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                  <span className="text-xs text-nov-s500">{columnLeads.length}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {columnLeads.map((lead) => (
                    <Card key={lead.id} padding={16}>
                      <div className="flex flex-col gap-1.5">
                        <div className="text-sm font-semibold text-nov-s100">{lead.name}</div>
                        <div className="text-[11.5px] text-nov-s500">{[lead.company, lead.email, lead.phone].filter(Boolean).join(" · ") || "—"}</div>

                        {lead.status !== "converted" && (
                          <div className="mt-1.5 flex flex-col gap-1.5">
                            <Select value={lead.status} onChange={(e) => handleStatusChange(lead.id, e.target.value as Exclude<LeadStatus, "converted">)}>
                              {UPDATABLE_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_LABEL[s]}
                                </option>
                              ))}
                            </Select>
                            <Button size="sm" onClick={() => setConvertingId(convertingId === lead.id ? null : lead.id)}>
                              Converter
                            </Button>
                          </div>
                        )}
                        {lead.status === "converted" && (
                          <div className="text-[11px] text-nov-s500">
                            Party: {lead.convertedPartyId?.slice(0, 8)}
                            {lead.convertedOpportunityId && <> · Opp: {lead.convertedOpportunityId.slice(0, 8)}</>}
                          </div>
                        )}

                        {convertingId === lead.id && (
                          <div className="mt-1 flex flex-col gap-2 border-t border-nov-border pt-2.5">
                            <Select value={partyType} onChange={(e) => setPartyType(e.target.value)}>
                              <option value="person">Pessoa</option>
                              <option value="external_organization">Organização</option>
                            </Select>
                            <label className="flex items-center gap-1.5 text-xs text-nov-s300">
                              <input type="checkbox" checked={createOpportunityToo} onChange={(e) => setCreateOpportunityToo(e.target.checked)} />
                              Criar Opportunity também
                            </label>
                            <Button size="sm" onClick={() => handleConvert(lead.id)}>
                              Confirmar conversão
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  {columnLeads.length === 0 && <div className="px-0.5 py-2.5 text-xs text-nov-s600">Nenhum aqui.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
