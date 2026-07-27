"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Pencil, Plus } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addStage, createPipeline, getToken, listPipelines, renamePipeline, renameStage, reorderStages, type Pipeline, type Stage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Reveal } from "@/components/reveal";
import { SkeletonCard } from "@/components/skeleton";

/**
 * Tela de Pipelines (`ADR-0051`, `ENG-0160`) — fecha o gap identificado em
 * auditoria de escopo: `Domain`+`Infrastructure` de `Pipeline`/`Stage` já
 * existiam desde `ENG-0043`, mas nunca ganharam `Application`/`API`/
 * `Frontend`. Múltiplos Pipelines nomeados por Organização; reorder de Stage
 * via drag-and-drop (`@dnd-kit`, primeira dependência de DnD real do projeto).
 */
export default function PipelinesPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [newPipelineName, setNewPipelineName] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [editingPipelineName, setEditingPipelineName] = useState<string | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageName, setEditingStageName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    void refresh();
  }, []);

  async function refresh(keepSelection = true): Promise<void> {
    setLoading(true);
    try {
      const list = await listPipelines();
      setPipelines(list);
      if (!keepSelection || !list.some((p) => p.id === selectedId)) {
        setSelectedId(list[0]?.id ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  const selected = pipelines.find((p) => p.id === selectedId);
  const sortedStages = selected ? [...selected.stages].sort((a, b) => a.order - b.order) : [];

  async function handleCreatePipeline(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      const created = await createPipeline(newPipelineName);
      setNewPipelineName("");
      await refresh(false);
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Pipeline");
    }
  }

  async function handleRenamePipeline(): Promise<void> {
    if (!selected || editingPipelineName === null) return;
    setError(null);
    try {
      await renamePipeline(selected.id, editingPipelineName);
      setEditingPipelineName(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao renomear Pipeline");
    }
  }

  async function handleAddStage(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!selected) return;
    setError(null);
    try {
      await addStage(selected.id, newStageName);
      setNewStageName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao adicionar Stage");
    }
  }

  async function handleRenameStage(stageId: string): Promise<void> {
    if (!selected) return;
    setError(null);
    try {
      await renameStage(selected.id, stageId, editingStageName);
      setEditingStageId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao renomear Stage");
    }
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!selected || !over || active.id === over.id) return;

    const oldIndex = sortedStages.findIndex((s) => s.id === active.id);
    const newIndex = sortedStages.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedStages, oldIndex, newIndex);
    setPipelines((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, stages: reordered.map((s, i) => ({ ...s, order: i })) } : p)),
    );

    setError(null);
    try {
      await reorderStages(
        selected.id,
        reordered.map((s) => s.id),
      );
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao reordenar Stages");
      await refresh();
    }
  }

  return (
    <DashboardShell title="Sales">
      <PageHeader title="Pipelines" description="Fluxos de trabalho configuráveis — cada Pipeline tem sua própria sequência de Stages." />

      <form onSubmit={handleCreatePipeline} className="mb-6 flex gap-2">
        <Input
          id="new-pipeline-name-input"
          placeholder="Nome do novo Pipeline"
          value={newPipelineName}
          onChange={(e) => setNewPipelineName(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" icon={<Plus size={15} />}>
          Novo Pipeline
        </Button>
      </form>

      {error && <p className="mb-4 text-[13px] text-nov-danger">{error}</p>}

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          <span className="sr-only">Carregando...</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && pipelines.length === 0 && (
        <EmptyState
          icon={<GitBranch size={22} />}
          message="Nenhum Pipeline ainda."
          action={
            <Button size="sm" icon={<Plus size={14} />} onClick={() => document.getElementById("new-pipeline-name-input")?.focus()}>
              Criar o primeiro Pipeline
            </Button>
          }
        />
      )}

      {!loading && pipelines.length > 0 && selected && (
        <>
          <div className="mb-5 flex items-center gap-3">
            <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-[240px]">
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>

            {editingPipelineName === null ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil size={13} />}
                onClick={() => setEditingPipelineName(selected.name)}
              >
                Renomear
              </Button>
            ) : (
              <>
                <Input
                  id="pipeline-rename-input"
                  value={editingPipelineName}
                  onChange={(e) => setEditingPipelineName(e.target.value)}
                  className="w-[200px]"
                />
                <Button size="sm" onClick={handleRenamePipeline}>
                  Salvar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setEditingPipelineName(null)}>
                  Cancelar
                </Button>
              </>
            )}
          </div>

          <form onSubmit={handleAddStage} className="mb-5 flex gap-2">
            <Input placeholder="Nome da nova Stage" value={newStageName} onChange={(e) => setNewStageName(e.target.value)} required className="w-[240px]" />
            <Button type="submit" size="sm" icon={<Plus size={13} />}>
              Adicionar Stage
            </Button>
          </form>

          {sortedStages.length === 0 && <p className="text-[13px] text-nov-s500">Nenhuma Stage ainda — adicione a primeira acima.</p>}

          {sortedStages.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedStages.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
                <div className="grid auto-cols-[220px] grid-flow-col gap-4 overflow-x-auto pb-2">
                  {sortedStages.map((stage, i) => (
                    <Reveal key={stage.id} index={i}>
                      <StageColumn
                        stage={stage}
                        editing={editingStageId === stage.id}
                        editingName={editingStageName}
                        onStartEdit={() => {
                          setEditingStageId(stage.id);
                          setEditingStageName(stage.name);
                        }}
                        onChangeEditingName={setEditingStageName}
                        onSave={() => handleRenameStage(stage.id)}
                        onCancel={() => setEditingStageId(null)}
                      />
                    </Reveal>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </DashboardShell>
  );
}

function StageColumn({
  stage,
  editing,
  editingName,
  onStartEdit,
  onChangeEditingName,
  onSave,
  onCancel,
}: {
  stage: Stage;
  editing: boolean;
  editingName: string;
  onStartEdit: () => void;
  onChangeEditingName: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-60")}
    >
      <Card padding={16} glow>
        <div {...attributes} {...listeners} className="mb-2 cursor-grab text-[10px] uppercase tracking-[0.08em] text-nov-s500 active:cursor-grabbing">
          Arraste para reordenar
        </div>
        {editing ? (
          <div className="flex flex-col gap-2">
            <Input value={editingName} onChange={(e) => onChangeEditingName(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSave}>
                Salvar
              </Button>
              <Button size="sm" variant="secondary" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-nov-s100">{stage.name}</span>
            <button onClick={onStartEdit} className="text-nov-s500 hover:text-nov-s200" aria-label={`Renomear ${stage.name}`}>
              <Pencil size={13} />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
