"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Download } from "lucide-react";
import {
  getMyOrganization,
  getToken,
  updateMyOrganization,
  updateOrganizationPlan,
  getFeatureFlag,
  setFeatureFlag,
  exportOrganizationData,
  downloadFile,
  type OrganizationProfile,
  type OrganizationPlan,
  type OrganizationBillingStatus,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input, Label, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { Tag } from "@/components/tag";

const PLAN_LABELS: Record<OrganizationPlan, string> = { starter: "Starter", professional: "Professional", enterprise: "Enterprise" };
const BILLING_LABELS: Record<OrganizationBillingStatus, string> = {
  trialing: "Em trial",
  active: "Ativo",
  overdue: "Em atraso",
  canceled: "Cancelado",
};

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

  const [plan, setPlan] = useState<OrganizationPlan>("starter");
  const [billingStatus, setBillingStatus] = useState<OrganizationBillingStatus>("trialing");
  const [maxUsers, setMaxUsers] = useState("");
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState(false);

  /** `ADR-0056` — piloto de `FeatureGuard`, gate por feature (não por domínio inteiro) em `POST /ai/text-to-sql`. */
  const [textToSqlEnabled, setTextToSqlEnabled] = useState(false);
  const [featureError, setFeatureError] = useState<string | null>(null);

  /** `ADR-0057` — export completo dos dados da própria Organization. */
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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
      setPlan(org.plan);
      setBillingStatus(org.billingStatus);
      setMaxUsers(org.maxUsers?.toString() ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }

    try {
      const flag = await getFeatureFlag("ai-runtime.text-to-sql");
      setTextToSqlEnabled(flag.enabled);
    } catch {
      setTextToSqlEnabled(false);
    }
  }

  async function handleToggleTextToSql(checked: boolean): Promise<void> {
    setFeatureError(null);
    const previous = textToSqlEnabled;
    setTextToSqlEnabled(checked);
    try {
      await setFeatureFlag("ai-runtime.text-to-sql", checked);
    } catch (err) {
      setTextToSqlEnabled(previous);
      setFeatureError(err instanceof Error ? err.message : "Falha ao atualizar feature");
    }
  }

  async function handleExportData(): Promise<void> {
    setExportError(null);
    setExportLoading(true);
    try {
      const { fileId } = await exportOrganizationData();
      await downloadFile(fileId);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Falha ao exportar dados");
    } finally {
      setExportLoading(false);
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

  /** `ENG-0164` — `PATCH /organizations/plan`, Permission distinta (`workspace.plan.manage`). */
  async function handlePlanSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setPlanError(null);
    setPlanSuccess(false);
    try {
      const trimmedMaxUsers = maxUsers.trim();
      const updated = await updateOrganizationPlan({
        plan,
        billingStatus,
        maxUsers: trimmedMaxUsers === "" ? null : Number(trimmedMaxUsers),
      });
      setOrganization(updated);
      setPlanSuccess(true);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "Falha ao salvar");
    }
  }

  return (
    <DashboardShell title="Workspace">
      <PageHeader title="Empresa" description="Perfil e plano da sua Organization." />

      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {success && <p className="text-[13px] text-nov-success">Salvo com sucesso.</p>}

      {organization && (
        <Card padding={28} className="max-w-[460px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="text-xs text-nov-s500">Slug: {organization.slug}</div>

            <div>
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="w-full" />
            </div>

            <div>
              <Label>Razão Social</Label>
              <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} required className="w-full" />
            </div>

            <div>
              <Label>Documento (CNPJ)</Label>
              <Input value={document} onChange={(e) => setDocument(e.target.value)} required className="w-full" />
            </div>

            <Button type="submit" icon={<Save size={15} />} className="mt-1 self-start">
              Salvar
            </Button>
          </form>
        </Card>
      )}

      {organization && (
        <Card padding={28} className="mt-6 max-w-[460px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-nov-s50">Plano</h2>
            <Tag tone={billingStatus === "active" ? "success" : billingStatus === "overdue" || billingStatus === "canceled" ? "danger" : "neutral"}>
              {BILLING_LABELS[organization.billingStatus]}
            </Tag>
          </div>

          {planError && <p className="mb-3 text-[13px] text-nov-danger">{planError}</p>}
          {planSuccess && <p className="mb-3 text-[13px] text-nov-success">Plano atualizado.</p>}

          <form onSubmit={handlePlanSubmit} className="flex flex-col gap-4">
            <div>
              <Label>Plano</Label>
              <Select value={plan} onChange={(e) => setPlan(e.target.value as OrganizationPlan)} className="w-full">
                {Object.entries(PLAN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Status de cobrança</Label>
              <Select value={billingStatus} onChange={(e) => setBillingStatus(e.target.value as OrganizationBillingStatus)} className="w-full">
                {Object.entries(BILLING_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Limite de usuários</Label>
              <Input
                type="number"
                min={1}
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                placeholder="Sem limite"
                className="w-full"
              />
              <p className="mt-1 text-xs text-nov-s500">Vazio = sem limite. Não há cobrança automática ainda (sem gateway de pagamento).</p>
            </div>

            <Button type="submit" icon={<Save size={15} />} className="mt-1 self-start">
              Salvar plano
            </Button>
          </form>
        </Card>
      )}

      {organization && (
        <Card padding={28} className="mt-6 max-w-[460px]">
          <h2 className="mb-1 text-[15px] font-semibold text-nov-s50">Features</h2>
          <p className="mb-4 text-xs text-nov-s500">Capabilities avançadas, ligadas/desligadas individualmente por Organization.</p>

          {featureError && <p className="mb-3 text-[13px] text-nov-danger">{featureError}</p>}

          <label className="flex items-center justify-between gap-4">
            <span className="text-[13px] text-nov-s200">
              Text-to-SQL (IA)
              <span className="block text-xs text-nov-s500">Consultar dados em linguagem natural via IA.</span>
            </span>
            <input
              type="checkbox"
              checked={textToSqlEnabled}
              onChange={(e) => void handleToggleTextToSql(e.target.checked)}
              className="h-5 w-5 accent-nov-b500"
            />
          </label>
        </Card>
      )}

      {organization && (
        <Card padding={28} className="mt-6 max-w-[460px]">
          <h2 className="mb-1 text-[15px] font-semibold text-nov-s50">Exportar dados</h2>
          <p className="mb-4 text-xs text-nov-s500">
            Baixe um arquivo .json com todos os dados de negócio desta Organization (sem credenciais).
          </p>

          {exportError && <p className="mb-3 text-[13px] text-nov-danger">{exportError}</p>}

          <Button type="button" icon={<Download size={15} />} onClick={() => void handleExportData()} loading={exportLoading} className="self-start">
            Exportar todos os dados
          </Button>
        </Card>
      )}
    </DashboardShell>
  );
}
