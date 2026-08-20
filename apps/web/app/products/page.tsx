"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import {
  activateProduct,
  createProduct,
  deactivateProduct,
  getToken,
  listProducts,
  updateProductPrice,
  updateProductFiscalLogisticsProfile,
  type Product,
  type FiscalLogisticsProfile,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusDonut } from "@/components/status-donut";

/** Estado do formulário (tudo string — inputs controlados) para o perfil fiscal-logístico (`ENG-0166`). */
interface FiscalLogisticsFormState {
  ncm: string;
  cfop: string;
  unit: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  variantLabel: string;
  parentProductId: string;
}

function emptyFiscalForm(): FiscalLogisticsFormState {
  return { ncm: "", cfop: "", unit: "", weightKg: "", lengthCm: "", widthCm: "", heightCm: "", variantLabel: "", parentProductId: "" };
}

function productToFiscalForm(product: Product): FiscalLogisticsFormState {
  return {
    ncm: product.ncm ?? "",
    cfop: product.cfop ?? "",
    unit: product.unit ?? "",
    weightKg: product.weightKg?.toString() ?? "",
    lengthCm: product.lengthCm?.toString() ?? "",
    widthCm: product.widthCm?.toString() ?? "",
    heightCm: product.heightCm?.toString() ?? "",
    variantLabel: product.variantLabel ?? "",
    parentProductId: product.parentProductId ?? "",
  };
}

/** `""` vira `undefined` na criação (campo nunca enviado) — distinto de `null` (usado só na edição, pra remover valor já existente). */
function fiscalFormToCreatePayload(form: FiscalLogisticsFormState): FiscalLogisticsProfile {
  return {
    ncm: form.ncm || undefined,
    cfop: form.cfop || undefined,
    unit: form.unit || undefined,
    weightKg: form.weightKg ? Number(form.weightKg) : undefined,
    lengthCm: form.lengthCm ? Number(form.lengthCm) : undefined,
    widthCm: form.widthCm ? Number(form.widthCm) : undefined,
    heightCm: form.heightCm ? Number(form.heightCm) : undefined,
    variantLabel: form.variantLabel || undefined,
    parentProductId: form.parentProductId || undefined,
  };
}

/** `""` vira `null` na edição — remove o valor explicitamente, em vez de ser ignorado como na criação. */
function fiscalFormToUpdatePayload(form: FiscalLogisticsFormState): FiscalLogisticsProfile {
  return {
    ncm: form.ncm || null,
    cfop: form.cfop || null,
    unit: form.unit || null,
    weightKg: form.weightKg ? Number(form.weightKg) : null,
    lengthCm: form.lengthCm ? Number(form.lengthCm) : null,
    widthCm: form.widthCm ? Number(form.widthCm) : null,
    heightCm: form.heightCm ? Number(form.heightCm) : null,
    variantLabel: form.variantLabel || null,
    parentProductId: form.parentProductId || null,
  };
}

function formatFiscalSummary(product: Product): string | null {
  const parts: string[] = [];
  if (product.ncm) parts.push(`NCM ${product.ncm}`);
  if (product.cfop) parts.push(`CFOP ${product.cfop}`);
  if (product.weightKg) parts.push(`${product.weightKg}kg`);
  if (product.lengthCm && product.widthCm && product.heightCm) {
    parts.push(`${product.lengthCm}×${product.widthCm}×${product.heightCm}cm`);
  }
  if (product.variantLabel) parts.push(`Variação: ${product.variantLabel}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Tela de Products (`ADR-0043`, `ENG-0144`) — catálogo do Sales Domain,
 * adaptado do Salesforce Product2, elevada visualmente em `ENG-0147`.
 * Perfil fiscal-logístico opcional (`ENG-0166`) — colapsado por padrão.
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

  // `ENG-0166` — perfil fiscal-logístico, opcional, colapsado por padrão (não polui o caso de uso de serviço/software puro).
  const [showFiscalFields, setShowFiscalFields] = useState(false);
  const [fiscalForm, setFiscalForm] = useState<FiscalLogisticsFormState>(emptyFiscalForm());
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [profileEdits, setProfileEdits] = useState<Record<string, FiscalLogisticsFormState>>({});
  const [profileError, setProfileError] = useState<string | null>(null);

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
      await createProduct(name, Number(unitPrice), sku || undefined, fiscalFormToCreatePayload(fiscalForm));
      setName("");
      setSku("");
      setUnitPrice("");
      setFiscalForm(emptyFiscalForm());
      setShowFiscalFields(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Produto");
    }
  }

  function toggleProfileEditor(product: Product): void {
    if (expandedProfileId === product.id) {
      setExpandedProfileId(null);
      return;
    }
    setProfileEdits((prev) => ({ ...prev, [product.id]: prev[product.id] ?? productToFiscalForm(product) }));
    setExpandedProfileId(product.id);
  }

  async function handleUpdateProfile(id: string): Promise<void> {
    const form = profileEdits[id];
    if (!form) return;
    setProfileError(null);
    try {
      await updateProductFiscalLogisticsProfile(id, fiscalFormToUpdatePayload(form));
      setExpandedProfileId(null);
      await refresh();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Falha ao atualizar perfil fiscal-logístico");
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
      setError(err instanceof Error ? err.message : "Falha ao desativar Produto");
    }
  }

  async function handleActivate(id: string): Promise<void> {
    setError(null);
    try {
      await activateProduct(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao reativar Produto");
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader title="Produtos" description="Catálogo interno, adaptado do Salesforce Product2." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/quotations")}>Orçamentos →</Button>} />

      <form onSubmit={handleCreate} className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="SKU (opcional)" value={sku} onChange={(e) => setSku(e.target.value)} />
          <Input placeholder="Preço unitário" type="number" step="0.01" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
          <Button type="submit" icon={<Package size={15} />}>
            Novo Produto
          </Button>
          <button
            type="button"
            onClick={() => setShowFiscalFields((prev) => !prev)}
            className="text-[12.5px] font-medium text-nov-b300 hover:underline"
          >
            {showFiscalFields ? "− Ocultar dados fiscais/logísticos" : "+ Dados fiscais/logísticos (opcional)"}
          </button>
        </div>

        {showFiscalFields && (
          <div className="flex flex-wrap gap-2 rounded-nov border border-nov-border bg-nov-bg2 p-3">
            <Input placeholder="NCM (8 dígitos)" value={fiscalForm.ncm} onChange={(e) => setFiscalForm((prev) => ({ ...prev, ncm: e.target.value }))} className="w-[130px]" />
            <Input placeholder="CFOP (4 dígitos)" value={fiscalForm.cfop} onChange={(e) => setFiscalForm((prev) => ({ ...prev, cfop: e.target.value }))} className="w-[110px]" />
            <Input placeholder="Unidade (UN/KG/CX)" value={fiscalForm.unit} onChange={(e) => setFiscalForm((prev) => ({ ...prev, unit: e.target.value }))} className="w-[130px]" />
            <Input placeholder="Peso (kg)" type="number" step="0.001" min="0" value={fiscalForm.weightKg} onChange={(e) => setFiscalForm((prev) => ({ ...prev, weightKg: e.target.value }))} className="w-[100px]" />
            <Input placeholder="Comp. (cm)" type="number" step="0.01" min="0" value={fiscalForm.lengthCm} onChange={(e) => setFiscalForm((prev) => ({ ...prev, lengthCm: e.target.value }))} className="w-[100px]" />
            <Input placeholder="Larg. (cm)" type="number" step="0.01" min="0" value={fiscalForm.widthCm} onChange={(e) => setFiscalForm((prev) => ({ ...prev, widthCm: e.target.value }))} className="w-[100px]" />
            <Input placeholder="Alt. (cm)" type="number" step="0.01" min="0" value={fiscalForm.heightCm} onChange={(e) => setFiscalForm((prev) => ({ ...prev, heightCm: e.target.value }))} className="w-[100px]" />
            <Input placeholder="Variação (ex: Azul - M)" value={fiscalForm.variantLabel} onChange={(e) => setFiscalForm((prev) => ({ ...prev, variantLabel: e.target.value }))} className="w-[160px]" />
            <Input placeholder="Produto pai (id, se for variação)" value={fiscalForm.parentProductId} onChange={(e) => setFiscalForm((prev) => ({ ...prev, parentProductId: e.target.value }))} className="w-[220px]" />
          </div>
        )}
      </form>

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && products.length === 0 && <EmptyState message="Nenhum Produto ainda." />}

      {!loading && products.length > 0 && (
        <div className="mb-6 max-w-[380px]">
          <StatusDonut
            title="Produtos por status"
            data={[
              { label: "Ativo", value: products.filter((p) => p.active).length, color: "var(--nov-success)" },
              { label: "Inativo", value: products.filter((p) => !p.active).length, color: "var(--nov-s500)" },
            ]}
          />
        </div>
      )}

      {profileError && <p className="mb-2 text-[13px] text-nov-danger">{profileError}</p>}

      <div className="flex flex-col gap-2.5">
        {products.map((product) => {
          const fiscalSummary = formatFiscalSummary(product);
          const isEditingProfile = expandedProfileId === product.id;
          const profileForm = profileEdits[product.id] ?? emptyFiscalForm();
          return (
            <Card key={product.id} padding={18}>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold text-nov-s100">{product.name}</div>
                  <div className="text-xs text-nov-s500">
                    {product.sku ? `SKU: ${product.sku} · ` : ""}R$ {product.unitPrice.toFixed(2)}
                  </div>
                  {fiscalSummary && <div className="text-xs text-nov-s500">{fiscalSummary}</div>}
                  <Tag tone={product.active ? "success" : "neutral"}>{product.active ? "Ativo" : "Inativo"}</Tag>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Novo preço"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceEdits[product.id] ?? ""}
                    onChange={(e) => setPriceEdits((prev) => ({ ...prev, [product.id]: e.target.value }))}
                    className="w-[120px]"
                  />
                  <Button size="sm" onClick={() => handleUpdatePrice(product.id)}>
                    Atualizar preço
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => toggleProfileEditor(product)}>
                    {isEditingProfile ? "Cancelar" : "Dados fiscais/logísticos"}
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

              {isEditingProfile && (
                <div className="mt-3 flex flex-wrap gap-2 rounded-nov border border-nov-border bg-nov-bg2 p-3">
                  <Input
                    placeholder="NCM (8 dígitos)"
                    value={profileForm.ncm}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, ncm: e.target.value } }))}
                    className="w-[130px]"
                  />
                  <Input
                    placeholder="CFOP (4 dígitos)"
                    value={profileForm.cfop}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, cfop: e.target.value } }))}
                    className="w-[110px]"
                  />
                  <Input
                    placeholder="Unidade"
                    value={profileForm.unit}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, unit: e.target.value } }))}
                    className="w-[110px]"
                  />
                  <Input
                    placeholder="Peso (kg)"
                    type="number"
                    step="0.001"
                    min="0"
                    value={profileForm.weightKg}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, weightKg: e.target.value } }))}
                    className="w-[100px]"
                  />
                  <Input
                    placeholder="Comp. (cm)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={profileForm.lengthCm}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, lengthCm: e.target.value } }))}
                    className="w-[100px]"
                  />
                  <Input
                    placeholder="Larg. (cm)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={profileForm.widthCm}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, widthCm: e.target.value } }))}
                    className="w-[100px]"
                  />
                  <Input
                    placeholder="Alt. (cm)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={profileForm.heightCm}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, heightCm: e.target.value } }))}
                    className="w-[100px]"
                  />
                  <Input
                    placeholder="Variação (ex: Azul - M)"
                    value={profileForm.variantLabel}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, variantLabel: e.target.value } }))}
                    className="w-[160px]"
                  />
                  <Input
                    placeholder="Produto pai (id)"
                    value={profileForm.parentProductId}
                    onChange={(e) => setProfileEdits((prev) => ({ ...prev, [product.id]: { ...profileForm, parentProductId: e.target.value } }))}
                    className="w-[220px]"
                  />
                  <Button size="sm" onClick={() => handleUpdateProfile(product.id)}>
                    Salvar perfil
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
