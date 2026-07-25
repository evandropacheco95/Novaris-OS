"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { activateContract, getToken, listContracts, terminateContract, type Contract, type ContractStatus } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

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

/**
 * Tela de Contracts (`ADR-0044`, `ENG-0145`) — adaptada do Salesforce
 * Contract, elevada em `ENG-0147`. Nasce exclusivamente a partir de uma
 * Quotation aceita (botão "Gerar Contract" em `/quotations`).
 */
export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
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

  return (
    <DashboardShell title="Sales">
      <PageHeader title="Contracts" description="Gerado exclusivamente a partir de uma Quotation aceita." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/quotations")}>← Quotations</Button>} />

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && contracts.length === 0 && <EmptyState message="Nenhum Contract ainda — gere um a partir de uma Quotation aceita." />}

      {!loading && contracts.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {(["draft", "active", "terminated"] as const).map((status) => {
            const columnContracts = contracts.filter((c) => c.status === status);
            return (
              <div key={status}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 2px" }}>
                  <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                  <span style={{ fontSize: 12, color: "var(--nov-s500)" }}>{columnContracts.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {columnContracts.map((contract) => (
                    <Card key={contract.id} padding={16}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 11, color: "var(--nov-s500)" }}>Opp: {contract.opportunityId.slice(0, 8)}</div>
                        <div style={{ fontSize: 11, color: "var(--nov-s500)" }}>Quotation: {contract.quotationId.slice(0, 8)}</div>
                        {contract.status === "draft" && (
                          <Button size="sm" onClick={() => handleTransition(contract.id, "activate")}>
                            Ativar
                          </Button>
                        )}
                        {contract.status === "active" && (
                          <Button size="sm" variant="secondary" onClick={() => handleTransition(contract.id, "terminate")}>
                            Encerrar
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                  {columnContracts.length === 0 && <div style={{ fontSize: 12, color: "var(--nov-s600)", padding: "10px 2px" }}>Nenhum aqui.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
