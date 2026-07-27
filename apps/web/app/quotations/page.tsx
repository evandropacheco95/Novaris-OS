"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import {
  acceptQuotation,
  addQuotationLineItem,
  createQuotation,
  generateContractFromQuotation,
  getToken,
  listOpportunities,
  listProducts,
  listQuotations,
  rejectQuotation,
  sendQuotation,
  type Opportunity,
  type Product,
  type Quotation,
  type QuotationStatus,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const STATUS_LABEL: Record<QuotationStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  accepted: "Aceita",
  rejected: "Rejeitada",
};

const STATUS_TONE: Record<QuotationStatus, "accent" | "success" | "danger" | "neutral"> = {
  draft: "neutral",
  sent: "accent",
  accepted: "success",
  rejected: "danger",
};

/**
 * Tela de Quotations (`ADR-0043`, `ENG-0144`) — preenche a lacuna reservada
 * desde `ADR-0020`, adaptada do Salesforce Quote, elevada em `ENG-0147`.
 */
export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [opportunityId, setOpportunityId] = useState("");
  const [addingToId, setAddingToId] = useState<string | null>(null);
  const [lineProductId, setLineProductId] = useState("");
  const [lineQuantity, setLineQuantity] = useState("1");
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
      const [quotationList, opportunityList, productList] = await Promise.all([listQuotations(), listOpportunities(), listProducts()]);
      setQuotations(quotationList);
      setOpportunities(opportunityList);
      setProducts(productList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  function productName(id: string): string {
    return products.find((p) => p.id === id)?.name ?? id;
  }

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createQuotation(opportunityId);
      setOpportunityId("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Quotation");
    }
  }

  async function handleAddLineItem(quotationId: string): Promise<void> {
    setError(null);
    try {
      await addQuotationLineItem(quotationId, lineProductId, Number(lineQuantity));
      setAddingToId(null);
      setLineProductId("");
      setLineQuantity("1");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao adicionar item");
    }
  }

  async function handleTransition(id: string, action: "send" | "accept" | "reject"): Promise<void> {
    setError(null);
    try {
      if (action === "send") await sendQuotation(id);
      if (action === "accept") await acceptQuotation(id);
      if (action === "reject") await rejectQuotation(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar Quotation");
    }
  }

  async function handleGenerateContract(quotationId: string): Promise<void> {
    setError(null);
    try {
      await generateContractFromQuotation(quotationId);
      router.push("/contracts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao gerar Contract");
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader
        title="Quotations"
        description="Precificação formal vinculada a uma Opportunity, adaptado do Salesforce Quote."
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => router.push("/opportunities")}>← Opportunities</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/products")}>Products →</Button>
            <Button variant="secondary" size="sm" onClick={() => router.push("/contracts")}>Contracts →</Button>
          </>
        }
      />

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Select value={opportunityId} onChange={(e) => setOpportunityId(e.target.value)} required className="flex-1">
          <option value="">Opportunity</option>
          {opportunities.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id}
            </option>
          ))}
        </Select>
        <Button type="submit" icon={<FileText size={15} />}>
          Nova Quotation
        </Button>
      </form>

      {!loading && opportunities.length === 0 && <p className="mb-4 text-[13px] text-nov-s500">Cadastre uma Opportunity antes de criar uma Quotation.</p>}
      {!loading && products.length === 0 && <p className="mb-4 text-[13px] text-nov-s500">Cadastre um Product antes de adicionar itens a uma Quotation.</p>}

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && quotations.length === 0 && <EmptyState message="Nenhuma Quotation ainda." />}

      {!loading && quotations.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {(["draft", "sent", "accepted", "rejected"] as const).map((status) => {
            const columnQuotations = quotations.filter((q) => q.status === status);
            return (
              <div key={status}>
                <div className="mb-3 flex items-center gap-2 px-0.5">
                  <Tag tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Tag>
                  <span className="text-xs text-nov-s500">{columnQuotations.length}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {columnQuotations.map((quotation) => (
                    <Card key={quotation.id} padding={16}>
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[11px] text-nov-s500">Opp: {quotation.opportunityId.slice(0, 8)}</div>
                        <div className="text-sm font-semibold text-nov-s100">R$ {quotation.total.toFixed(2)}</div>

                        {quotation.lineItems.length > 0 && (
                          <div className="mt-0.5 flex flex-col gap-0.5 border-t border-nov-border pt-2">
                            {quotation.lineItems.map((item) => (
                              <div key={item.id} className="text-[11.5px] text-nov-s400">
                                {productName(item.productId)} · {item.quantity}× = R$ {item.lineTotal.toFixed(2)}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {quotation.status === "draft" && (
                            <>
                              <Button size="sm" variant="secondary" onClick={() => setAddingToId(addingToId === quotation.id ? null : quotation.id)}>+ Item</Button>
                              <Button size="sm" onClick={() => handleTransition(quotation.id, "send")}>Enviar</Button>
                            </>
                          )}
                          {quotation.status === "sent" && (
                            <>
                              <Button size="sm" onClick={() => handleTransition(quotation.id, "accept")}>Aceitar</Button>
                              <Button size="sm" variant="secondary" onClick={() => handleTransition(quotation.id, "reject")}>Rejeitar</Button>
                            </>
                          )}
                          {quotation.status === "accepted" && (
                            <Button size="sm" onClick={() => handleGenerateContract(quotation.id)}>Gerar Contract</Button>
                          )}
                        </div>

                        {addingToId === quotation.id && (
                          <div className="mt-0.5 flex flex-col gap-1.5 border-t border-nov-border pt-2">
                            <Select value={lineProductId} onChange={(e) => setLineProductId(e.target.value)}>
                              <option value="">Product</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (R$ {p.unitPrice.toFixed(2)})
                                </option>
                              ))}
                            </Select>
                            <div className="flex gap-1.5">
                              <Input type="number" min="1" value={lineQuantity} onChange={(e) => setLineQuantity(e.target.value)} className="w-[70px]" />
                              <Button size="sm" onClick={() => handleAddLineItem(quotation.id)}>Adicionar</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  {columnQuotations.length === 0 && <div className="px-0.5 py-2.5 text-xs text-nov-s600">Nenhuma aqui.</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
