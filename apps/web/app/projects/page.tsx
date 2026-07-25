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

      {error && <p style={{ color: "var(--nov-danger)", fontSize: 13 }}>{error}</p>}
      {loading && <p style={{ color: "var(--nov-s500)", fontSize: 13 }}>Carregando...</p>}

      <form onSubmit={handleCreateProject} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Input placeholder="Nome do Project" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: 1 }} />
        <Button type="submit" icon={<FolderPlus size={15} />}>
          Novo Project
        </Button>
      </form>

      {!loading && projects.length === 0 && <EmptyState message="Nenhum Project ainda." />}

      {!loading && projects.some((p) => p.tasks.length > 0) && (
        <div style={{ maxWidth: 380, marginBottom: 24 }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {projects.map((project) => (
          <Card key={project.id} padding={20}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--nov-s100)", marginBottom: 14 }}>{project.name}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 14px",
                    background: "var(--nov-bg2)",
                    border: "1px solid var(--nov-border)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--nov-s200)" }}>{task.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Tag tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Tag>
                    <Select
                      value={task.status}
                      onChange={(e) => handleStatusChange(project.id, task.id, e.target.value as ProjectTask["status"])}
                      style={{ padding: "5px 9px", fontSize: 12 }}
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
              {project.tasks.length === 0 && <div style={{ fontSize: 12, color: "var(--nov-s500)" }}>Nenhuma Task ainda.</div>}
            </div>

            <form onSubmit={(e) => handleAddTask(project.id, e)} style={{ display: "flex", gap: 8 }}>
              <Input
                placeholder="Nova Task"
                value={taskTitles[project.id] ?? ""}
                onChange={(e) => setTaskTitles((prev) => ({ ...prev, [project.id]: e.target.value }))}
                style={{ flex: 1 }}
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
