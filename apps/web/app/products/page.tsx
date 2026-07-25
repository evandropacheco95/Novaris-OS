"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { activateProduct, createProduct, deactivateProduct, getToken, listProducts, updateProductPrice, type Product } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusDonut } from "@/components/status-donut";

/**
 * Tela de Products (`ADR-0043`, `ENG-0144`) — catálogo do Sales Domain,
 * adaptado do Salesforce Product2, elevada visualmente em `ENG-0147`.
 */
export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});
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
      setProducts(await listProducts());
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
      await createProduct(name, Number(unitPrice), sku || undefined);
      setName("");
      setSku("");
      setUnitPrice("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Product");
    }
  }

  async function handleUpdatePrice(id: string): Promise<void> {
    const value = priceEdits[id];
    if (!value) return;
    setError(null);
    try {
      await updateProductPrice(id, Number(value));
      setPriceEdits((prev) => ({ ...prev, [id]: "" }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar preço");
    }
  }

  async function handleDeactivate(id: string): Promise<void> {
    setError(null);
    try {
      await deactivateProduct(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao desativar Product");
    }
  }

  async function handleActivate(id: string): Promise<void> {
    setError(null);
    try {
      await activateProduct(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao reativar Product");
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader title="Products" description="Catálogo interno, adaptado do Salesforce Product2." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/quotations")}>Quotations →</Button>} />

      <form onSubmit={handleCreate} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="SKU (opcional)" value={sku} onChange={(e) => setSku(e.target.value)} />
        <Input placeholder="Preço unitário" type="number" step="0.01" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
        <Button type="submit" icon={<Package size={15} />}>
          Novo Product
        </Button>
      </form>

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}
      {!loading && products.length === 0 && <EmptyState message="Nenhum Product ainda." />}

      {!loading && products.length > 0 && (
        <div style={{ maxWidth: 380, marginBottom: 24 }}>
          <StatusDonut
            title="Products por status"
            data={[
              { label: "Ativo", value: products.filter((p) => p.active).length, color: "var(--nov-success)" },
              { label: "Inativo", value: products.filter((p) => !p.active).length, color: "var(--nov-s500)" },
            ]}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {products.map((product) => (
          <Card key={product.id} padding={18}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 14, color: "var(--nov-s100)", fontWeight: 600 }}>{product.name}</div>
                <div style={{ fontSize: 12, color: "var(--nov-s500)" }}>
                  {product.sku ? `SKU: ${product.sku} · ` : ""}R$ {product.unitPrice.toFixed(2)}
                </div>
                <Tag tone={product.active ? "success" : "neutral"}>{product.active ? "Ativo" : "Inativo"}</Tag>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Input
                  placeholder="Novo preço"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceEdits[product.id] ?? ""}
                  onChange={(e) => setPriceEdits((prev) => ({ ...prev, [product.id]: e.target.value }))}
                  style={{ width: 120 }}
                />
                <Button size="sm" onClick={() => handleUpdatePrice(product.id)}>
                  Atualizar preço
                </Button>
                {product.active ? (
                  <Button size="sm" variant="secondary" onClick={() => handleDeactivate(product.id)}>
                    Desativar
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => handleActivate(product.id)}>
                    Reativar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
