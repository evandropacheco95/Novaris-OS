"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, RefreshCw, Upload } from "lucide-react";
import {
  createAdvertisingAccount,
  getToken,
  importAdvertisingCsv,
  listAdvertisingAccounts,
  syncAdvertisingAccount,
  type AdvertisingAccount,
  type AdvertisingConnectionStatus,
  type AdvertisingCsvReportType,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Tag } from "@/components/tag";

/**
 * Tela de Performance Intelligence — Advertising Domain (`ADR-0059`/`ADR-0060`).
 * Deliberadamente fora do sidebar (`ENG-0143-0146/ENG-0164`, ver
 * `components/dashboard-shell.tsx`) — só acessível por URL direta, mesmo
 * critério de "ainda não é Fase 12". Sync ao vivo via OAuth (Feature A do
 * plano de Fase 02) ainda não tem tela — só o botão "Sincronizar" para contas
 * já `CONNECTED`/`SYNC_FAILED` por algum outro caminho. O caminho real hoje é
 * o import manual de CSV (Feature B), enquanto o developer token do Google
 * Ads estiver preso em nível "Test Account".
 */

const STATUS_LABEL: Record<AdvertisingConnectionStatus, string> = {
  NOT_CONNECTED: "Não conectada",
  CONNECTED: "Conectada",
  SYNC_REQUIRED: "Sync pendente",
  SYNCING: "Sincronizando",
  SYNC_FAILED: "Falha no sync",
};

const STATUS_TONE: Record<AdvertisingConnectionStatus, "accent" | "success" | "danger" | "neutral"> = {
  NOT_CONNECTED: "neutral",
  CONNECTED: "success",
  SYNC_REQUIRED: "accent",
  SYNCING: "accent",
  SYNC_FAILED: "danger",
};

const REPORT_TYPE_LABEL: Record<AdvertisingCsvReportType, string> = {
  campaigns: "Campanhas",
  ad_groups: "Grupos de anúncios",
  keywords: "Palavras-chave",
};

export default function PerformanceIntelligencePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AdvertisingAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [importingToId, setImportingToId] = useState<string | null>(null);
  const [reportTypeByAccount, setReportTypeByAccount] = useState<Record<string, AdvertisingCsvReportType>>({});
  const [lastImportResult, setLastImportResult] = useState<{ accountId: string; reportType: AdvertisingCsvReportType; campaignsSynced: number; adGroupsSynced: number; keywordsSynced: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setAccounts(await listAdvertisingAccounts());
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
      await createAdvertisingAccount(name);
      setName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Conta de Anúncios");
    }
  }

  async function handleSync(accountId: string): Promise<void> {
    setError(null);
    setSyncingId(accountId);
    try {
      await syncAdvertisingAccount(accountId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao sincronizar");
    } finally {
      setSyncingId(null);
    }
  }

  function handlePickFile(accountId: string): void {
    setImportingToId(accountId);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    const accountId = importingToId;
    event.target.value = "";
    if (!file || !accountId) return;
    const reportType = reportTypeByAccount[accountId] ?? "campaigns";
    setError(null);
    try {
      const result = await importAdvertisingCsv(accountId, reportType, file);
      setLastImportResult({ accountId, ...result });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao importar CSV");
    } finally {
      setImportingToId(null);
    }
  }

  return (
    <DashboardShell title="Performance Intelligence">
      <PageHeader title="Performance Intelligence" description="Contas de mídia paga — Google Ads." />

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}

      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap gap-2">
        <Input placeholder="Nome da conta" value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
        <Button type="submit" icon={<Megaphone size={15} />}>
          Nova Conta
        </Button>
      </form>

      {!loading && accounts.length === 0 && <EmptyState message="Nenhuma Conta de Anúncios ainda." />}

      <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelected} />

      <div className="flex flex-col gap-2.5">
        {accounts.map((account) => (
          <Card key={account.id} padding={18}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm text-nov-s200">{account.name}</div>
                <div className="mt-1.5">
                  <Tag tone={STATUS_TONE[account.connectionStatus]}>{STATUS_LABEL[account.connectionStatus]}</Tag>
                </div>
                {account.lastSyncAt && (
                  <div className="mt-1.5 text-xs text-nov-s500">Último sync: {new Date(account.lastSyncAt).toLocaleString("pt-BR")}</div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(account.connectionStatus === "CONNECTED" || account.connectionStatus === "SYNC_FAILED") && (
                  <Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} loading={syncingId === account.id} onClick={() => handleSync(account.id)}>
                    Sincronizar
                  </Button>
                )}

                <Select
                  value={reportTypeByAccount[account.id] ?? "campaigns"}
                  onChange={(e) => setReportTypeByAccount((prev) => ({ ...prev, [account.id]: e.target.value as AdvertisingCsvReportType }))}
                  className="py-[7px] text-[12.5px]"
                >
                  {Object.entries(REPORT_TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Button size="sm" variant="secondary" icon={<Upload size={14} />} loading={importingToId === account.id} onClick={() => handlePickFile(account.id)}>
                  Importar CSV
                </Button>
              </div>
            </div>

            {lastImportResult?.accountId === account.id && (
              <div className="mt-3 border-t border-nov-border pt-2.5 text-xs text-nov-s400">
                Import de {REPORT_TYPE_LABEL[lastImportResult.reportType]} concluído: {lastImportResult.campaignsSynced + lastImportResult.adGroupsSynced + lastImportResult.keywordsSynced} linha(s)
                importada(s)
                {lastImportResult.skipped > 0 && <> · {lastImportResult.skipped} pulada(s)</>}.
              </div>
            )}
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
