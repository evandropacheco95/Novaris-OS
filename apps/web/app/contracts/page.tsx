"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { activateContract, generateRevenueFromContract, getToken, listContracts, terminateContract, type Contract, type ContractStatus } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { SkeletonCard } from "@/components/skeleton";

const STATUS_LABEL: Record<ContractStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  terminated: "Encerrado",
};

const STATUS_TONE: Record<ContractStatus, "neutral" | "success" | "danger"> = {
  draft: "neutral",
  active: "success",
  terminated: "danger",
};

const STATUS_COLUMN_BORDER: Record<ContractStatus, string> = {
  draft: "border-t-nov-s500",
  active: "border-t-nov-success",
  terminated: "border-t-nov-danger",
};

/**
 * Tela de Contracts (`ADR-0044`, `ENG-0145`) — adaptada do Salesforce
 * Contract, elevada em `ENG-0147`/`ENG-0151` (board). Nasce exclusivamente a
 * partir de uma Quotation aceita (botão "Gerar Contract" em `/quotations`).
 * Ganhou reconhecimento de Revenue em `ENG-0152`. Migrado para Tailwind em
 * `ENG-0157` — achado real durante a migração: o botão "Reconhecer Revenue"
 * havia sido perdido numa reconstrução de histórico git anterior desta
 * sessão, restaurado aqui.
 */
export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recognizingId, setRecognizingId] = useState<string | null>(null);
  const [revenueAmount, setRevenueAmount] = useState("");
  const [revenueCurrency, setRevenueCurrency] = useState("BRL");

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
      setContracts(await listContracts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleTransition(id: string, action: "activate" | "terminate"): Promise<void> {
    setError(null);
    try {
      if (action === "activate") await activateContract(id);
      if (action === "terminate") await terminateContract(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar Contract");
    }
  }

  async function handleGenerateRevenue(contractId: string): Promise<void> {
    setError(null);
    try {
      await generateRevenueFromContract(contractId, Number(revenueAmount), revenueCurrency);
      setRecognizingId(null);
      setRevenueAmount("");
      router.push("/revenue");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar Revenue");
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader
        title="Contracts"
        description="Gerado exclusivamente a partir de uma Quotation aceita."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => router.push("/quotations")}>← Quotations</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/revenue")}>Revenue →</Button>
          </>
        }
      />

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          <span className="sr-only">Carregando...</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && contracts.length === 0 && (
        <EmptyState
          message="Nenhum Contract ainda — gere um a partir de uma Quotation aceita."
          action={
            <Button size="sm" onClick={() => router.push("/quotations")}>
              Ir para Quotations
            </Button>
          }
        />
      )}

      {!loading && contracts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(["draft", "active", "terminated"] as const).map((status) => {
            const columnContracts = contracts.filter((c) => c.status === status);
            return (
              <div key={status}>
                <div className={cn("mb-3 flex items-center gap-2 border-t-2 px-0.5 pt-2.5", STATUS_COLUMN_BORDER[status])}>
                  <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                  <span className="text-xs text-nov-s500">{columnContracts.length}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {columnContracts.map((contract, i) => (
                    <Reveal key={contract.id} index={i}>
                    <Card padding={16} glow>
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[11px] text-nov-s500">Opp: {contract.opportunityId.slice(0, 8)}</div>
                        <div className="text-[11px] text-nov-s500">Quotation: {contract.quotationId.slice(0, 8)}</div>
                        {contract.status === "draft" && (
                          <Button size="sm" onClick={() => handleTransition(contract.id, "activate")}>
                            Ativar
                          </Button>
                        )}
                        {contract.status === "active" && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-1.5">
                              <Button size="sm" onClick={() => setRecognizingId(recognizingId === contract.id ? null : contract.id)}>
                                Reconhecer Revenue
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => handleTransition(contract.id, "terminate")}>
                                Encerrar
                              </Button>
                            </div>
                            {recognizingId === contract.id && (
                              <div className="mt-0.5 flex flex-col gap-1.5 border-t border-nov-border pt-2">
                                <div className="flex gap-1.5">
                                  <Input type="number" min="0.01" step="0.01" placeholder="Valor" value={revenueAmount} onChange={(e) => setRevenueAmount(e.target.value)} className="w-[90px]" />
                                  <Input placeholder="Moeda" value={revenueCurrency} onChange={(e) => setRevenueCurrency(e.target.value)} className="w-[70px]" />
                                </div>
                                <Button size="sm" onClick={() => handleGenerateRevenue(contract.id)}>
                                  Confirmar
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                    </Reveal>
                  ))}
                  {columnContracts.length === 0 && <div className="px-0.5 py-2.5 text-xs text-nov-s600">Nenhum aqui.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
