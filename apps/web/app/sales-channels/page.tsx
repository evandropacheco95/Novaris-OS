"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import {
  activateSalesChannel,
  createSalesChannel,
  deactivateSalesChannel,
  getToken,
  listSalesChannels,
  renameSalesChannel,
  type SalesChannel,
  type SalesChannelType,
} from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

const TYPE_LABELS: Record<SalesChannelType, string> = {
  direct: "Direto",
  distributor: "Distribuidor/Revenda",
  marketplace: "Marketplace",
  online_store: "Loja própria online",
};

/**
 * Tela de Canais de Venda (`ADR-0052`) — `SalesChannel` como conceito de 1ª
 * classe do Sales Domain, referência real: Winnet (indústria+e-commerce
 * com canal de venda direto, `ENG-0166`). Os 4 tipos são os confirmados
 * pelo CTO — nenhum tipo adicional inventado.
 */
export default function SalesChannelsPage() {
  const router = useRouter();
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<SalesChannelType>("direct");
  const [renameEdits, setRenameEdits] = useState<Record<string, string>>({});
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
      setSalesChannels(await listSalesChannels());
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
      await createSalesChannel(name, type);
      setName("");
      setType("direct");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar canal de venda");
    }
  }

  async function handleRename(id: string): Promise<void> {
    const value = renameEdits[id];
    if (!value) return;
    setError(null);
    try {
      await renameSalesChannel(id, value);
      setRenameEdits((prev) => ({ ...prev, [id]: "" }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao renomear");
    }
  }

  async function handleDeactivate(id: string): Promise<void> {
    setError(null);
    try {
      await deactivateSalesChannel(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao desativar");
    }
  }

  async function handleActivate(id: string): Promise<void> {
    setError(null);
    try {
      await activateSalesChannel(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao reativar");
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader title="Canais de Venda" description="Canal de venda como conceito de 1ª classe — direto, distribuidor, marketplace ou loja própria." />

      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap gap-2">
        <Input placeholder="Nome (ex: Mercado Livre)" value={name} onChange={(e) => setName(e.target.value)} required />
        <Select value={type} onChange={(e) => setType(e.target.value as SalesChannelType)} className="w-[200px]">
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button type="submit" icon={<Radio size={15} />}>
          Novo Canal
        </Button>
      </form>

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && salesChannels.length === 0 && <EmptyState message="Nenhum canal de venda ainda." />}

      <div className="flex flex-col gap-2.5">
        {salesChannels.map((channel) => (
          <Card key={channel.id} padding={18}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-nov-s100">{channel.name}</div>
                <div className="text-xs text-nov-s500">{TYPE_LABELS[channel.type]}</div>
                <Tag tone={channel.active ? "success" : "neutral"}>{channel.active ? "Ativo" : "Inativo"}</Tag>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Novo nome"
                  value={renameEdits[channel.id] ?? ""}
                  onChange={(e) => setRenameEdits((prev) => ({ ...prev, [channel.id]: e.target.value }))}
                  className="w-[160px]"
                />
                <Button size="sm" onClick={() => handleRename(channel.id)}>
                  Renomear
                </Button>
                {channel.active ? (
                  <Button size="sm" variant="secondary" onClick={() => handleDeactivate(channel.id)}>
                    Desativar
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => handleActivate(channel.id)}>
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
