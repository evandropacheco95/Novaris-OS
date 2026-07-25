/**
 * Cliente HTTP mínimo para a NOVARIS API (`apps/api`) — primeiro consumidor
 * real de frontend (`ENG-0123`, Frontend Web #1). Guarda o JWT em
 * `localStorage` (aceitável para esta fase de prova; um cookie `httpOnly`
 * seria a evolução natural quando este app deixar de ser uma prova de
 * conceito, ver `apps/web/README.md`).
 */

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "novaris_access_token";
const USER_KEY = "novaris_user";

export interface AuthenticatedUser {
  id: string;
  organizationId: string;
  email: string;
  status: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface ApiError {
  code: string;
  message: string;
}

export function saveSession(response: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, response.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthenticatedUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthenticatedUser) : null;
}

/**
 * Lê `getUser()` só depois do mount (`useEffect`, nunca no corpo do
 * componente) — `getUser()` chamado direto no corpo (`typeof window !==
 * "undefined" ? getUser() : null`) fazia o SSR renderizar `null` e o cliente
 * já hidratar com o usuário real, gerando "Hydration failed" em toda tela que
 * usa `DashboardShell` (achado real de `ENG-0148`, nunca causava erro visível
 * mas poluía o console/overlay de dev). `null` no primeiro render client-side
 * garante que bata com o SSR; o valor real chega no re-render seguinte.
 */
export function useCurrentUser(): AuthenticatedUser | null {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  useEffect(() => {
    setUser(getUser());
  }, []);
  return user;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await response.json()) as LoginResponse | ApiError;
  if (!response.ok) {
    throw new Error((body as ApiError).message ?? "Falha ao autenticar");
  }
  return body as LoginResponse;
}

async function authenticatedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
}

export interface Opportunity {
  id: string;
  organizationId: string;
  partyId: string;
  status: "open" | "won" | "lost";
  createdAt: string;
  updatedAt: string;
  pipelineId?: string;
  currentStageId?: string;
}

export async function listOpportunities(): Promise<Opportunity[]> {
  const response = await authenticatedFetch("/opportunities");
  if (!response.ok) {
    throw new Error("Falha ao listar Opportunities");
  }
  return (await response.json()) as Opportunity[];
}

export async function createOpportunity(partyId: string, organizationId: string): Promise<Opportunity> {
  const response = await authenticatedFetch("/opportunities", {
    method: "POST",
    body: JSON.stringify({ organizationId, partyId }),
  });
  const body = (await response.json()) as Opportunity | ApiError;
  if (!response.ok) {
    throw new Error((body as ApiError).message ?? "Falha ao criar Opportunity");
  }
  return body as Opportunity;
}

export async function markWon(id: string): Promise<Opportunity> {
  const response = await authenticatedFetch(`/opportunities/${id}/won`, { method: "POST" });
  const body = (await response.json()) as Opportunity | ApiError;
  if (!response.ok) {
    throw new Error((body as ApiError).message ?? "Falha ao marcar como Won");
  }
  return body as Opportunity;
}

export async function markLost(id: string): Promise<Opportunity> {
  const response = await authenticatedFetch(`/opportunities/${id}/lost`, { method: "POST" });
  const body = (await response.json()) as Opportunity | ApiError;
  if (!response.ok) {
    throw new Error((body as ApiError).message ?? "Falha ao marcar como Lost");
  }
  return body as Opportunity;
}

// Customer Domain (`ENG-0125`/`ENG-0127`)

export interface Party {
  id: string;
  organizationId: string;
  partyType: "person" | "external_organization";
  name: string;
  document?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  organizationId: string;
  partyIdA: string;
  partyIdB: string;
  type: "cliente" | "fornecedor" | "parceiro" | "prospect" | "investidor" | "colaborador";
  createdAt: string;
  updatedAt: string;
}

export async function listParties(): Promise<Party[]> {
  const response = await authenticatedFetch("/parties");
  if (!response.ok) {
    throw new Error("Falha ao listar Parties");
  }
  return (await response.json()) as Party[];
}

export async function createParty(partyType: string, name: string, document?: string): Promise<Party> {
  const response = await authenticatedFetch("/parties", {
    method: "POST",
    body: JSON.stringify({ partyType, name, document }),
  });
  const body = (await response.json()) as Party | ApiError;
  if (!response.ok) {
    throw new Error((body as ApiError).message ?? "Falha ao criar Party");
  }
  return body as Party;
}

export async function listRelationships(): Promise<Relationship[]> {
  const response = await authenticatedFetch("/relationships");
  if (!response.ok) {
    throw new Error("Falha ao listar Relationships");
  }
  return (await response.json()) as Relationship[];
}

export async function createRelationship(partyIdA: string, partyIdB: string, type: string): Promise<Relationship> {
  const response = await authenticatedFetch("/relationships", {
    method: "POST",
    body: JSON.stringify({ partyIdA, partyIdB, type }),
  });
  const body = (await response.json()) as Relationship | ApiError;
  if (!response.ok) {
    throw new Error((body as ApiError).message ?? "Falha ao criar Relationship");
  }
  return body as Relationship;
}

// Identity Domain (`ENG-0128`)

export interface IdentityUser {
  id: string;
  organizationId: string;
  email: string;
  status: "created" | "invited" | "active" | "disabled";
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  organizationId: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

async function parseOrThrow<T>(response: Response, fallback: string): Promise<T> {
  const body = (await response.json()) as T | ApiError;
  if (!response.ok) {
    throw new Error((body as ApiError).message ?? fallback);
  }
  return body as T;
}

export async function listUsers(): Promise<IdentityUser[]> {
  const response = await authenticatedFetch("/users");
  if (!response.ok) throw new Error("Falha ao listar Users");
  return (await response.json()) as IdentityUser[];
}

export async function createUser(email: string): Promise<IdentityUser> {
  const response = await authenticatedFetch("/users", { method: "POST", body: JSON.stringify({ email }) });
  return parseOrThrow<IdentityUser>(response, "Falha ao criar User");
}

export async function activateUser(id: string): Promise<IdentityUser> {
  const response = await authenticatedFetch(`/users/${id}/activate`, { method: "POST" });
  return parseOrThrow<IdentityUser>(response, "Falha ao ativar User");
}

export async function disableUser(id: string): Promise<IdentityUser> {
  const response = await authenticatedFetch(`/users/${id}/disable`, { method: "POST" });
  return parseOrThrow<IdentityUser>(response, "Falha ao desativar User");
}

export async function assignRole(userId: string, roleId: string): Promise<IdentityUser> {
  const response = await authenticatedFetch(`/users/${userId}/roles`, { method: "POST", body: JSON.stringify({ roleId }) });
  return parseOrThrow<IdentityUser>(response, "Falha ao atribuir Role");
}

export async function revokeRole(userId: string, roleId: string): Promise<IdentityUser> {
  const response = await authenticatedFetch(`/users/${userId}/roles/${roleId}`, { method: "DELETE" });
  return parseOrThrow<IdentityUser>(response, "Falha ao revogar Role");
}

export async function listRoles(): Promise<Role[]> {
  const response = await authenticatedFetch("/roles");
  if (!response.ok) throw new Error("Falha ao listar Roles");
  return (await response.json()) as Role[];
}

export async function createRole(name: string): Promise<Role> {
  const response = await authenticatedFetch("/roles", { method: "POST", body: JSON.stringify({ name }) });
  return parseOrThrow<Role>(response, "Falha ao criar Role");
}

export async function grantPermission(roleId: string, permissionCode: string): Promise<Role> {
  const response = await authenticatedFetch(`/roles/${roleId}/permissions`, { method: "POST", body: JSON.stringify({ permissionCode }) });
  return parseOrThrow<Role>(response, "Falha ao conceder Permission");
}

// Organization Domain (`ENG-0128`)

export interface OrganizationAddress {
  street: string;
  number: string;
  district: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrganizationProfile {
  id: string;
  slug: string;
  name: string;
  legalName: string;
  document: string;
  address: OrganizationAddress;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function getMyOrganization(): Promise<OrganizationProfile> {
  const response = await authenticatedFetch("/organizations/me");
  if (!response.ok) throw new Error("Falha ao buscar Organization");
  return (await response.json()) as OrganizationProfile;
}

export async function updateMyOrganization(patch: Partial<Pick<OrganizationProfile, "name" | "legalName" | "document">>): Promise<OrganizationProfile> {
  const response = await authenticatedFetch("/organizations/me", { method: "PATCH", body: JSON.stringify(patch) });
  return parseOrThrow<OrganizationProfile>(response, "Falha ao atualizar Organization");
}

// Project Domain (`ENG-0129`)

export interface ProjectTask {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  tasks: ProjectTask[];
  createdAt: string;
  updatedAt: string;
}

export async function listProjects(): Promise<Project[]> {
  const response = await authenticatedFetch("/projects");
  if (!response.ok) throw new Error("Falha ao listar Projects");
  return (await response.json()) as Project[];
}

export async function createProject(name: string): Promise<Project> {
  const response = await authenticatedFetch("/projects", { method: "POST", body: JSON.stringify({ name }) });
  return parseOrThrow<Project>(response, "Falha ao criar Project");
}

export async function addTask(projectId: string, title: string): Promise<Project> {
  const response = await authenticatedFetch(`/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify({ title }) });
  return parseOrThrow<Project>(response, "Falha ao adicionar Task");
}

export async function updateTaskStatus(projectId: string, taskId: string, status: ProjectTask["status"]): Promise<Project> {
  const response = await authenticatedFetch(`/projects/${projectId}/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
  return parseOrThrow<Project>(response, "Falha ao atualizar status");
}

// Financial Domain (`ENG-0131`)

export interface Invoice {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid";
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function listInvoices(): Promise<Invoice[]> {
  const response = await authenticatedFetch("/invoices");
  if (!response.ok) throw new Error("Falha ao listar Invoices");
  return (await response.json()) as Invoice[];
}

export async function createInvoice(amount: number, currency: string, subscriptionId?: string): Promise<Invoice> {
  const response = await authenticatedFetch("/invoices", { method: "POST", body: JSON.stringify({ amount, currency, subscriptionId }) });
  return parseOrThrow<Invoice>(response, "Falha ao criar Invoice");
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  const response = await authenticatedFetch(`/invoices/${id}/pay`, { method: "POST" });
  return parseOrThrow<Invoice>(response, "Falha ao marcar Invoice como paga");
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const response = await authenticatedFetch("/subscriptions");
  if (!response.ok) throw new Error("Falha ao listar Subscriptions");
  return (await response.json()) as Subscription[];
}

export async function createSubscription(name: string): Promise<Subscription> {
  const response = await authenticatedFetch("/subscriptions", { method: "POST", body: JSON.stringify({ name }) });
  return parseOrThrow<Subscription>(response, "Falha ao criar Subscription");
}

// Activity Domain (`ENG-0133`)

export type ActivityType = "ligacao" | "whatsapp" | "email" | "reuniao" | "visita" | "nota";

export interface Activity {
  id: string;
  organizationId: string;
  partyId: string;
  type: ActivityType;
  status: "open" | "completed";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export async function listActivities(): Promise<Activity[]> {
  const response = await authenticatedFetch("/activities");
  if (!response.ok) throw new Error("Falha ao listar Activities");
  return (await response.json()) as Activity[];
}

export async function createActivity(partyId: string, type: ActivityType, notes?: string): Promise<Activity> {
  const response = await authenticatedFetch("/activities", { method: "POST", body: JSON.stringify({ partyId, type, notes }) });
  return parseOrThrow<Activity>(response, "Falha ao criar Activity");
}

export async function completeActivity(id: string): Promise<Activity> {
  const response = await authenticatedFetch(`/activities/${id}/complete`, { method: "POST" });
  return parseOrThrow<Activity>(response, "Falha ao concluir Activity");
}

// Marketing Domain (`ENG-0133`)

export interface Asset {
  id: string;
  fileRecordId: string;
  addedAt: string;
}

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const response = await authenticatedFetch("/campaigns");
  if (!response.ok) throw new Error("Falha ao listar Campaigns");
  return (await response.json()) as Campaign[];
}

export async function createCampaign(name: string, startDate?: string, endDate?: string): Promise<Campaign> {
  const response = await authenticatedFetch("/campaigns", { method: "POST", body: JSON.stringify({ name, startDate, endDate }) });
  return parseOrThrow<Campaign>(response, "Falha ao criar Campaign");
}

export async function addAssetToCampaign(campaignId: string, fileRecordId: string): Promise<Campaign> {
  const response = await authenticatedFetch(`/campaigns/${campaignId}/assets`, { method: "POST", body: JSON.stringify({ fileRecordId }) });
  return parseOrThrow<Campaign>(response, "Falha ao associar Asset");
}

// FileRecord (`ADR-0039`, Kernel) — upload multipart real, reaproveitado por Marketing (`ADR-0048`).

export interface FileRecord {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

/** Upload multipart — não usa `authenticatedFetch` (que fixa `Content-Type: application/json`); o navegador define o boundary correto sozinho. */
export async function uploadFile(file: File): Promise<FileRecord> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getToken();
  const response = await fetch(`${API_URL}/files`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  return parseOrThrow<FileRecord>(response, "Falha ao enviar arquivo");
}

/**
 * `GET /files/:id` exige `Authorization: Bearer` — um `<a href>` puro não
 * envia o header, por isso baixa via `fetch` + Blob temporário. Nome do
 * arquivo lido do `Content-Disposition` que a API já envia (`filename="..."`)
 * — sem isso, o navegador usa o UUID interno de armazenamento como nome.
 */
export async function downloadFile(fileRecordId: string): Promise<void> {
  const response = await authenticatedFetch(`/files/${fileRecordId}`);
  if (!response.ok) throw new Error("Falha ao baixar arquivo");
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = match?.[1] ?? "";
  link.click();
  URL.revokeObjectURL(url);
}

// Analytics Domain (`ENG-0133`)

export type WidgetType = "kpi" | "list" | "donut" | "bar";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  metricKey: string;
}

export interface Dashboard {
  id: string;
  organizationId: string;
  name: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

export async function listDashboards(): Promise<Dashboard[]> {
  const response = await authenticatedFetch("/dashboards");
  if (!response.ok) throw new Error("Falha ao listar Dashboards");
  return (await response.json()) as Dashboard[];
}

export async function createDashboard(name: string): Promise<Dashboard> {
  const response = await authenticatedFetch("/dashboards", { method: "POST", body: JSON.stringify({ name }) });
  return parseOrThrow<Dashboard>(response, "Falha ao criar Dashboard");
}

export async function addWidgetToDashboard(dashboardId: string, type: WidgetType, title: string, metricKey: string): Promise<Dashboard> {
  const response = await authenticatedFetch(`/dashboards/${dashboardId}/widgets`, {
    method: "POST",
    body: JSON.stringify({ type, title, metricKey }),
  });
  return parseOrThrow<Dashboard>(response, "Falha ao adicionar Widget");
}

// System / Audit Domain (`ADR-0035`, `ENG-0135`) — somente leitura, sem create: entradas nascem só do enriquecimento automático (ver ADR-0035).

export interface AuditEntry {
  id: string;
  actorId: string;
  organizationId: string;
  targetId: string;
  targetType: string;
  action: string;
  occurredAt: string;
  origin: string;
  changeSet?: Record<string, unknown>;
}

export async function listAuditEntries(): Promise<AuditEntry[]> {
  const response = await authenticatedFetch("/audit-entries");
  if (!response.ok) throw new Error("Falha ao listar AuditEntries");
  return (await response.json()) as AuditEntry[];
}

// Lead (`ADR-0042`, `ENG-0143`) — adaptado do Lead-to-Convert do Salesforce.

export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  convertedPartyId?: string;
  convertedOpportunityId?: string;
  createdAt: string;
  updatedAt: string;
}

export async function listLeads(): Promise<Lead[]> {
  const response = await authenticatedFetch("/leads");
  if (!response.ok) throw new Error("Falha ao listar Leads");
  return (await response.json()) as Lead[];
}

export async function createLead(name: string, email?: string, phone?: string, company?: string, source?: string): Promise<Lead> {
  const response = await authenticatedFetch("/leads", { method: "POST", body: JSON.stringify({ name, email, phone, company, source }) });
  return parseOrThrow<Lead>(response, "Falha ao criar Lead");
}

export async function updateLeadStatus(id: string, status: Exclude<LeadStatus, "converted">): Promise<Lead> {
  const response = await authenticatedFetch(`/leads/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
  return parseOrThrow<Lead>(response, "Falha ao atualizar status do Lead");
}

export async function convertLead(id: string, partyType: string, createOpportunity: boolean): Promise<Lead> {
  const response = await authenticatedFetch(`/leads/${id}/convert`, { method: "POST", body: JSON.stringify({ partyType, createOpportunity }) });
  return parseOrThrow<Lead>(response, "Falha ao converter Lead");
}

// Product (`ADR-0043`) — catálogo do Sales Domain, adaptado do Salesforce Product2.

export interface Product {
  id: string;
  name: string;
  sku?: string;
  unitPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listProducts(): Promise<Product[]> {
  const response = await authenticatedFetch("/products");
  if (!response.ok) throw new Error("Falha ao listar Products");
  return (await response.json()) as Product[];
}

export async function createProduct(name: string, unitPrice: number, sku?: string): Promise<Product> {
  const response = await authenticatedFetch("/products", { method: "POST", body: JSON.stringify({ name, unitPrice, sku }) });
  return parseOrThrow<Product>(response, "Falha ao criar Product");
}

export async function updateProductPrice(id: string, unitPrice: number): Promise<Product> {
  const response = await authenticatedFetch(`/products/${id}/price`, { method: "POST", body: JSON.stringify({ unitPrice }) });
  return parseOrThrow<Product>(response, "Falha ao atualizar preço do Product");
}

export async function deactivateProduct(id: string): Promise<Product> {
  const response = await authenticatedFetch(`/products/${id}/deactivate`, { method: "POST" });
  return parseOrThrow<Product>(response, "Falha ao desativar Product");
}

export async function activateProduct(id: string): Promise<Product> {
  const response = await authenticatedFetch(`/products/${id}/activate`, { method: "POST" });
  return parseOrThrow<Product>(response, "Falha ao reativar Product");
}

// Quotation (`ADR-0043`) — preenche a lacuna reservada desde `ADR-0020`, adaptado do Salesforce Quote.

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected";

export interface QuotationLineItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  opportunityId: string;
  status: QuotationStatus;
  lineItems: QuotationLineItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export async function listQuotations(): Promise<Quotation[]> {
  const response = await authenticatedFetch("/quotations");
  if (!response.ok) throw new Error("Falha ao listar Quotations");
  return (await response.json()) as Quotation[];
}

export async function createQuotation(opportunityId: string): Promise<Quotation> {
  const response = await authenticatedFetch("/quotations", { method: "POST", body: JSON.stringify({ opportunityId }) });
  return parseOrThrow<Quotation>(response, "Falha ao criar Quotation");
}

export async function addQuotationLineItem(quotationId: string, productId: string, quantity: number): Promise<Quotation> {
  const response = await authenticatedFetch(`/quotations/${quotationId}/line-items`, { method: "POST", body: JSON.stringify({ productId, quantity }) });
  return parseOrThrow<Quotation>(response, "Falha ao adicionar item à Quotation");
}

export async function sendQuotation(id: string): Promise<Quotation> {
  const response = await authenticatedFetch(`/quotations/${id}/send`, { method: "POST" });
  return parseOrThrow<Quotation>(response, "Falha ao enviar Quotation");
}

export async function acceptQuotation(id: string): Promise<Quotation> {
  const response = await authenticatedFetch(`/quotations/${id}/accept`, { method: "POST" });
  return parseOrThrow<Quotation>(response, "Falha ao aceitar Quotation");
}

export async function rejectQuotation(id: string): Promise<Quotation> {
  const response = await authenticatedFetch(`/quotations/${id}/reject`, { method: "POST" });
  return parseOrThrow<Quotation>(response, "Falha ao rejeitar Quotation");
}

// Case (`ADR-0043`) — Activity Domain, adaptado do Salesforce Service Cloud.

export type CaseStatus = "new" | "in_progress" | "closed";
export type CasePriority = "low" | "medium" | "high";

export interface Case {
  id: string;
  partyId: string;
  subject: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  updatedAt: string;
}

export async function listCases(): Promise<Case[]> {
  const response = await authenticatedFetch("/cases");
  if (!response.ok) throw new Error("Falha ao listar Cases");
  return (await response.json()) as Case[];
}

export async function createCase(partyId: string, subject: string, priority: CasePriority, description?: string): Promise<Case> {
  const response = await authenticatedFetch("/cases", { method: "POST", body: JSON.stringify({ partyId, subject, priority, description }) });
  return parseOrThrow<Case>(response, "Falha ao criar Case");
}

export async function startCase(id: string): Promise<Case> {
  const response = await authenticatedFetch(`/cases/${id}/start`, { method: "POST" });
  return parseOrThrow<Case>(response, "Falha ao iniciar atendimento do Case");
}

export async function closeCase(id: string): Promise<Case> {
  const response = await authenticatedFetch(`/cases/${id}/close`, { method: "POST" });
  return parseOrThrow<Case>(response, "Falha ao fechar Case");
}

// Comment (`ADR-0043`) — Activity Domain, adaptado do Salesforce Chatter. Polimórfico: `targetType` é texto livre.

export interface Comment {
  id: string;
  targetType: string;
  targetId: string;
  authorUserId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export async function listComments(targetType?: string, targetId?: string): Promise<Comment[]> {
  const query = targetType && targetId ? `?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}` : "";
  const response = await authenticatedFetch(`/comments${query}`);
  if (!response.ok) throw new Error("Falha ao listar Comments");
  return (await response.json()) as Comment[];
}

export async function createComment(targetType: string, targetId: string, body: string): Promise<Comment> {
  const response = await authenticatedFetch("/comments", { method: "POST", body: JSON.stringify({ targetType, targetId, body }) });
  return parseOrThrow<Comment>(response, "Falha ao criar Comment");
}

export async function updateComment(id: string, body: string): Promise<Comment> {
  const response = await authenticatedFetch(`/comments/${id}`, { method: "POST", body: JSON.stringify({ body }) });
  return parseOrThrow<Comment>(response, "Falha ao editar Comment");
}

export async function deleteComment(id: string): Promise<void> {
  const response = await authenticatedFetch(`/comments/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new Error(body.message ?? "Falha ao excluir Comment");
  }
}

// Contract (`ADR-0044`) — gerado a partir de uma Quotation aceita, adaptado do Salesforce Contract.

export type ContractStatus = "draft" | "active" | "terminated";

export interface Contract {
  id: string;
  opportunityId: string;
  quotationId: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export async function listContracts(): Promise<Contract[]> {
  const response = await authenticatedFetch("/contracts");
  if (!response.ok) throw new Error("Falha ao listar Contracts");
  return (await response.json()) as Contract[];
}

export async function generateContractFromQuotation(quotationId: string): Promise<Contract> {
  const response = await authenticatedFetch(`/quotations/${quotationId}/generate-contract`, { method: "POST" });
  return parseOrThrow<Contract>(response, "Falha ao gerar Contract");
}

export async function activateContract(id: string): Promise<Contract> {
  const response = await authenticatedFetch(`/contracts/${id}/activate`, { method: "POST" });
  return parseOrThrow<Contract>(response, "Falha ao ativar Contract");
}

export async function terminateContract(id: string): Promise<Contract> {
  const response = await authenticatedFetch(`/contracts/${id}/terminate`, { method: "POST" });
  return parseOrThrow<Contract>(response, "Falha ao encerrar Contract");
}

// Revenue (`ADR-0047`) — gerado a partir de um Contract active, sem estados (registro pontual).

export interface Revenue {
  id: string;
  contractId: string;
  amount: number;
  currency: string;
  recognizedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function listRevenues(): Promise<Revenue[]> {
  const response = await authenticatedFetch("/revenues");
  if (!response.ok) throw new Error("Falha ao listar Revenues");
  return (await response.json()) as Revenue[];
}

export async function generateRevenueFromContract(contractId: string, amount: number, currency: string): Promise<Revenue> {
  const response = await authenticatedFetch(`/contracts/${contractId}/generate-revenue`, {
    method: "POST",
    body: JSON.stringify({ amount, currency }),
  });
  return parseOrThrow<Revenue>(response, "Falha ao gerar Revenue");
}

// CalendarEvent (`ADR-0045`) — Activity Domain, adaptado do Salesforce Event.

export interface CalendarEvent {
  id: string;
  partyId: string;
  subject: string;
  startAt: string;
  endAt: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  const response = await authenticatedFetch("/calendar-events");
  if (!response.ok) throw new Error("Falha ao listar CalendarEvents");
  return (await response.json()) as CalendarEvent[];
}

export async function createCalendarEvent(partyId: string, subject: string, startAt: string, endAt: string, location?: string): Promise<CalendarEvent> {
  const response = await authenticatedFetch("/calendar-events", { method: "POST", body: JSON.stringify({ partyId, subject, startAt, endAt, location }) });
  return parseOrThrow<CalendarEvent>(response, "Falha ao criar CalendarEvent");
}

export async function rescheduleCalendarEvent(id: string, startAt: string, endAt: string): Promise<CalendarEvent> {
  const response = await authenticatedFetch(`/calendar-events/${id}/reschedule`, { method: "POST", body: JSON.stringify({ startAt, endAt }) });
  return parseOrThrow<CalendarEvent>(response, "Falha ao reagendar CalendarEvent");
}

// Reminder (`ADR-0045`) — Activity Domain, adaptado do Salesforce Reminder.

export interface Reminder {
  id: string;
  partyId: string;
  message: string;
  remindAt: string;
  dismissed: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listReminders(): Promise<Reminder[]> {
  const response = await authenticatedFetch("/reminders");
  if (!response.ok) throw new Error("Falha ao listar Reminders");
  return (await response.json()) as Reminder[];
}

export async function createReminder(partyId: string, message: string, remindAt: string): Promise<Reminder> {
  const response = await authenticatedFetch("/reminders", { method: "POST", body: JSON.stringify({ partyId, message, remindAt }) });
  return parseOrThrow<Reminder>(response, "Falha ao criar Reminder");
}

export async function dismissReminder(id: string): Promise<Reminder> {
  const response = await authenticatedFetch(`/reminders/${id}/dismiss`, { method: "POST" });
  return parseOrThrow<Reminder>(response, "Falha ao dispensar Reminder");
}

// Checklist (`ADR-0045`) — Activity Domain.

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  partyId: string;
  title: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export async function listChecklists(): Promise<Checklist[]> {
  const response = await authenticatedFetch("/checklists");
  if (!response.ok) throw new Error("Falha ao listar Checklists");
  return (await response.json()) as Checklist[];
}

export async function createChecklist(partyId: string, title: string): Promise<Checklist> {
  const response = await authenticatedFetch("/checklists", { method: "POST", body: JSON.stringify({ partyId, title }) });
  return parseOrThrow<Checklist>(response, "Falha ao criar Checklist");
}

export async function addChecklistItem(checklistId: string, label: string): Promise<Checklist> {
  const response = await authenticatedFetch(`/checklists/${checklistId}/items`, { method: "POST", body: JSON.stringify({ label }) });
  return parseOrThrow<Checklist>(response, "Falha ao adicionar item ao Checklist");
}

export async function toggleChecklistItem(checklistId: string, itemId: string): Promise<Checklist> {
  const response = await authenticatedFetch(`/checklists/${checklistId}/items/${itemId}/toggle`, { method: "POST" });
  return parseOrThrow<Checklist>(response, "Falha ao alternar item do Checklist");
}
