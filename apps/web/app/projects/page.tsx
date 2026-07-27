"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { addTask, createProject, getToken, listProjects, updateTaskStatus, type Project, type ProjectTask } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { Tag } from "@/components/tag";
import { Button } from "@/components/button";
import { Input, Select } from "@/components/input";
import { Card } from "@/components/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusDonut } from "@/components/status-donut";

const STATUS_LABEL: Record<ProjectTask["status"], string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const STATUS_TONE: Record<ProjectTask["status"], "neutral" | "accent" | "success" | "danger"> = {
  pending: "neutral",
  in_progress: "accent",
  completed: "success",
  cancelled: "danger",
};

const STATUS_ORDER: ProjectTask["status"][] = ["pending", "in_progress", "completed", "cancelled"];

/**
 * Tela de Projects — Project Domain (`ENG-0129`), elevada em `ENG-0147`.
 * Lista/cria Projects, adiciona Tasks, avança o status de cada Task.
 */
export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [taskTitles, setTaskTitles] = useState<Record<string, string>>({});
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
      setProjects(await listProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    try {
      await createProject(name);
      setName("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar Project");
    }
  }

  async function handleAddTask(projectId: string, event: FormEvent): Promise<void> {
    event.preventDefault();
    const title = taskTitles[projectId]?.trim();
    if (!title) return;
    setError(null);
    try {
      await addTask(projectId, title);
      setTaskTitles((prev) => ({ ...prev, [projectId]: "" }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao adicionar Task");
    }
  }

  async function handleStatusChange(projectId: string, taskId: string, status: ProjectTask["status"]): Promise<void> {
    setError(null);
    try {
      await updateTaskStatus(projectId, taskId, status);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar status");
    }
  }

  return (
    <DashboardShell title="Project">
      <PageHeader title="Projects" description="Projetos e suas Tasks." />

      {error && <p className="text-[13px] text-nov-danger">{error}</p>}
      {loading && <p className="text-[13px] text-nov-s500">Carregando...</p>}

      <form onSubmit={handleCreateProject} className="mb-6 flex gap-2">
        <Input placeholder="Nome do Project" value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
        <Button type="submit" icon={<FolderPlus size={15} />}>
          Novo Project
        </Button>
      </form>

      {!loading && projects.length === 0 && <EmptyState message="Nenhum Project ainda." />}

      {!loading && projects.some((p) => p.tasks.length > 0) && (
        <div className="mb-6 max-w-[380px]">
          <StatusDonut
            title="Tasks por status (todos os Projects)"
            data={STATUS_ORDER.map((status) => ({
              label: STATUS_LABEL[status],
              value: projects.reduce((sum, p) => sum + p.tasks.filter((t) => t.status === status).length, 0),
              color: { pending: "var(--nov-s500)", in_progress: "var(--nov-b500)", completed: "var(--nov-success)", cancelled: "var(--nov-danger)" }[status],
            }))}
          />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <Card key={project.id} padding={20}>
            <div className="mb-3.5 text-[15px] font-semibold text-nov-s100">{project.name}</div>

            <div className="mb-3.5 flex flex-col gap-2">
              {project.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-nov border border-nov-border bg-nov-bg2 px-3.5 py-2">
                  <span className="text-[13px] text-nov-s200">{task.title}</span>
                  <div className="flex items-center gap-2">
                    <Tag tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Tag>
                    <Select
                      value={task.status}
                      onChange={(e) => handleStatusChange(project.id, task.id, e.target.value as ProjectTask["status"])}
                      className="px-2.5 py-[5px] text-xs"
                    >
                      {STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
              {project.tasks.length === 0 && <div className="text-xs text-nov-s500">Nenhuma Task ainda.</div>}
            </div>

            <form onSubmit={(e) => handleAddTask(project.id, e)} className="flex gap-2">
              <Input
                placeholder="Nova Task"
                value={taskTitles[project.id] ?? ""}
                onChange={(e) => setTaskTitles((prev) => ({ ...prev, [project.id]: e.target.value }))}
                className="flex-1"
              />
              <Button type="submit" size="sm" variant="secondary">
                Adicionar Task
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
