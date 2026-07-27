"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, Filter } from "lucide-react";
import { createComment, deleteComment, getToken, listComments, updateComment, type Comment } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

/**
 * Tela de Comments (`ADR-0043`, `ENG-0144`) — adaptada do Salesforce
 * Chatter, elevada em `ENG-0147`. Genuinamente polimórfica (`targetType`
 * livre, sem enum fechado).
 */
export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [targetType, setTargetType] = useState("");
  const [targetId, setTargetId] = useState("");
  const [body, setBody] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterId, setFilterId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    void refresh();
  }, []);

  async function refresh(filterOverrides?: { type?: string; id?: string }): Promise<void> {
    setLoading(true);
    try {
      const type = filterOverrides?.type ?? filterType;
      const id = filterOverrides?.id ?? filterId;
      setComments(await listComments(type || undefined, id || undefined));
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
      await createComment(targetType, targetId, body);
      setBody("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Comment");
    }
  }

  async function handleFilter(event: FormEvent): Promise<void> {
    event.preventDefault();
    await refresh({ type: filterType, id: filterId });
  }

  async function handleUpdate(id: string): Promise<void> {
    setError(null);
    try {
      await updateComment(id, editBody);
      setEditingId(null);
      setEditBody("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao editar Comment");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setError(null);
    try {
      await deleteComment(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao excluir Comment");
    }
  }

  return (
    <DashboardShell title="Activity">
      <PageHeader title="Comments" description="Feed polimórfico, adaptado do Salesforce Chatter." actions={<Button variant="secondary" size="sm" onClick={() => router.push("/activity")}>← Activity</Button>} />

      <form onSubmit={handleCreate} className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Tipo do alvo (ex.: lead, case, opportunity)" value={targetType} onChange={(e) => setTargetType(e.target.value)} required />
        <Input placeholder="ID do alvo" value={targetId} onChange={(e) => setTargetId(e.target.value)} required />
        <Input placeholder="Comentário" value={body} onChange={(e) => setBody(e.target.value)} required className="flex-1" />
        <Button type="submit" icon={<MessageSquarePlus size={15} />}>
          Novo Comment
        </Button>
      </form>

      <form onSubmit={handleFilter} className="mb-6 flex gap-2">
        <Input placeholder="Filtrar por tipo" value={filterType} onChange={(e) => setFilterType(e.target.value)} />
        <Input placeholder="Filtrar por ID do alvo" value={filterId} onChange={(e) => setFilterId(e.target.value)} />
        <Button type="submit" variant="secondary" icon={<Filter size={14} />}>
          Filtrar
        </Button>
      </form>

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}
      {!loading && comments.length === 0 && <EmptyState message="Nenhum Comment ainda." />}

      <div className="flex flex-col gap-2.5">
        {comments.map((comment) => (
          <Card key={comment.id} padding={18}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <Tag tone="neutral">
                  {comment.targetType}:{comment.targetId}
                </Tag>
                {editingId === comment.id ? <Input value={editBody} onChange={(e) => setEditBody(e.target.value)} /> : <div className="text-sm text-nov-s100">{comment.body}</div>}
              </div>
              <div className="flex shrink-0 gap-2">
                {editingId === comment.id ? (
                  <Button size="sm" onClick={() => handleUpdate(comment.id)}>Salvar</Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditBody(comment.body);
                    }}
                  >
                    Editar
                  </Button>
                )}
                <Button size="sm" variant="danger" onClick={() => handleDelete(comment.id)}>Excluir</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
