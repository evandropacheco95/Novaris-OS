"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { getMyOrganization, getToken, updateMyOrganization, type OrganizationProfile } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input, Label } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";

/**
 * Tela de Configurações — Organization Domain (`ENG-0128`), elevada em
 * `ENG-0147`. Mostra e atualiza o perfil da própria Organization autenticada.
 */
export default function SettingsPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [document, setDocument] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
      const org = await getMyOrganization();
      setOrganization(org);
      setName(org.name);
      setLegalName(org.legalName);
      setDocument(org.document);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateMyOrganization({ name, legalName, document });
      setOrganization(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar");
    }
  }

  return (
    <DashboardShell title="Workspace">
      <PageHeader title="Workspace" description="Perfil da sua Organization." />

      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {success && <p style={{ color: "var(--nov-success)", fontSize: 13 }}>Salvo com sucesso.</p>}

      {organization && (
        <Card padding={28} style={{ maxWidth: 460 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 12, color: "var(--nov-s500)" }}>Slug: {organization.slug}</div>

            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%" }} />
            </div>

            <div>
              <Label>Razão Social</Label>
              <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} required style={{ width: "100%" }} />
            </div>

            <div>
              <Label>Documento (CNPJ)</Label>
              <Input value={document} onChange={(e) => setDocument(e.target.value)} required style={{ width: "100%" }} />
            </div>

            <Button type="submit" icon={<Save size={15} />} style={{ marginTop: 4, alignSelf: "flex-start" }}>
              Salvar
            </Button>
          </form>
        </Card>
      )}
    </DashboardShell>
  );
}
