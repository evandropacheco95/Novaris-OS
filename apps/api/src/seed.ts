import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Organization, createOrganizationRepository } from "@novaris/organizations";
import {
  User,
  Role,
  Email,
  Permission,
  createUserRepository,
  createRoleRepository,
  setCredential,
} from "@novaris/identity";

/**
 * Seed de bootstrap (Identity/Auth MVP, `ENG-0122`) — cria a primeira
 * Organization real da NOVARIS e os 2 primeiros Users (super master +
 * usuário de teste), com credenciais reais na tabela `credentials`
 * (Infrastructure, `ADR-0010`). Idempotente por checagem prévia (slug/email)
 * — rodar de novo não duplica nada.
 *
 * `BOOTSTRAP_SYSTEM_ID` representa "o sistema" como `createdBy` do primeiro
 * User/Role de uma Organization nova — nenhum User humano existe ainda para
 * ser o autor. Mesma necessidade operacional de qualquer sistema com
 * Auditable (`createdBy` obrigatório, `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 4`).
 */
const BOOTSTRAP_SYSTEM_ID = new UniqueEntityId("00000000-0000-0000-0000-000000000000");

/**
 * Catálogo de Permissions (`ADR-0036`) — um código por Controller protegido,
 * `manage` onde há rota de escrita, `read` onde só há leitura (`system.audit-entries`).
 * `SuperMaster`/`Usuario` recebem o catálogo inteiro — preserva a paridade de
 * acesso que já existia entre as duas Roles (nenhuma perde acesso a nada que
 * já tinha); diferenciá-las fica deliberadamente adiado (`ADR-0036`, Decisões
 * Adiadas — decisão de produto sem fonte).
 */
const FULL_PERMISSION_CATALOG = [
  "sales.opportunities.manage",
  "sales.pipelines.manage",
  "relationship.parties.manage",
  "relationship.relationships.manage",
  "identity.users.manage",
  "identity.roles.manage",
  "workspace.profile.manage",
  "project.projects.manage",
  "financial.invoices.manage",
  "financial.subscriptions.manage",
  "activity.activities.manage",
  "marketing.campaigns.manage",
  "analytics.dashboards.manage",
  "system.audit-entries.read",
  "system.configuration.manage",
  "system.feature-flags.manage",
  "system.files.manage",
  "system.integration-hub.manage",
  "system.automation-rules.manage",
  "system.ai-runtime.manage",
  "sales.leads.manage",
  "sales.products.manage",
  "sales.quotations.manage",
  "activity.cases.manage",
  "activity.comments.manage",
  "sales.contracts.manage",
  "sales.revenues.manage",
  "activity.calendar-events.manage",
  "activity.reminders.manage",
  "activity.checklists.manage",
] as const;

/** Concede todo código do catálogo ainda não presente na Role — idempotente, nunca duplica. */
async function ensureFullPermissionCatalog(role: Role, roleRepository: ReturnType<typeof createRoleRepository>): Promise<void> {
  let changed = false;
  for (const code of FULL_PERMISSION_CATALOG) {
    if (!role.permissions.some((granted) => granted.code === code)) {
      role.grantPermission(Permission.create(code).getValue()!, BOOTSTRAP_SYSTEM_ID);
      changed = true;
    }
  }
  if (changed) {
    await roleRepository.save(role);
    console.log(`Permissions atualizadas para Role "${role.name}": ${role.permissions.map((p) => p.code).join(", ")}`);
  }
}

async function main(): Promise<void> {
  const organizationRepository = createOrganizationRepository(prisma);
  const userRepository = createUserRepository(prisma);
  const roleRepository = createRoleRepository(prisma);

  // 1. Organization
  const existingOrgs = (await organizationRepository.findAll()).getValue()!;
  let organization = existingOrgs.find((org) => org.slug === "novaris");
  if (!organization) {
    organization = Organization.create({
      slug: "novaris",
      name: "NOVARIS",
      legalName: "NOVARIS Tecnologia Ltda.",
      document: "00.000.000/0001-00",
      address: {
        street: "Não informado",
        number: "S/N",
        district: "Não informado",
        city: "São Paulo",
        state: "SP",
        zipCode: "00000-000",
        country: "Brasil",
      },
      status: "active",
    }).getValue()!;
    await organizationRepository.save(organization);
    console.log(`Organization criada: ${organization.slug} (${organization.id.toString()})`);
  } else {
    console.log(`Organization já existia: ${organization.slug} (${organization.id.toString()})`);
  }

  // 2. Role "SuperMaster" — catálogo completo de permissões (`ADR-0036`)
  const existingRoles = (await roleRepository.findAll()).getValue()!;
  let superMasterRole = existingRoles.find((role) => role.name === "SuperMaster" && role.organizationId.equals(organization!.id));
  if (!superMasterRole) {
    superMasterRole = Role.create({
      organizationId: organization.id,
      name: "SuperMaster",
      createdBy: BOOTSTRAP_SYSTEM_ID,
    }).getValue()!;
    await roleRepository.save(superMasterRole);
    console.log(`Role criada: ${superMasterRole.name} (${superMasterRole.id.toString()})`);
  } else {
    console.log(`Role já existia: ${superMasterRole.name} (${superMasterRole.id.toString()})`);
  }
  await ensureFullPermissionCatalog(superMasterRole, roleRepository);

  // 3. Role "Usuario" — mesmo catálogo completo, para o usuário de teste (paridade preservada, `ADR-0036`)
  let usuarioRole = existingRoles.find((role) => role.name === "Usuario" && role.organizationId.equals(organization!.id));
  if (!usuarioRole) {
    usuarioRole = Role.create({
      organizationId: organization.id,
      name: "Usuario",
      createdBy: BOOTSTRAP_SYSTEM_ID,
    }).getValue()!;
    await roleRepository.save(usuarioRole);
    console.log(`Role criada: ${usuarioRole.name} (${usuarioRole.id.toString()})`);
  } else {
    console.log(`Role já existia: ${usuarioRole.name} (${usuarioRole.id.toString()})`);
  }
  await ensureFullPermissionCatalog(usuarioRole, roleRepository);

  // 4. User super master — Evandro
  await ensureUser({
    userRepository,
    organizationId: organization.id,
    email: "evandrinhop@gmail.com",
    roleId: superMasterRole.id,
    password: "Tripinha1.",
  });

  // 5. User de teste
  await ensureUser({
    userRepository,
    organizationId: organization.id,
    email: "testenovaris@testenovaris.com.br",
    roleId: usuarioRole.id,
    password: "teste@novaris",
  });

  console.log("Seed concluído.");
}

async function ensureUser(input: {
  userRepository: ReturnType<typeof createUserRepository>;
  organizationId: UniqueEntityId;
  email: string;
  roleId: UniqueEntityId;
  password: string;
}): Promise<void> {
  const existingUsers = (await input.userRepository.findAll()).getValue()!;
  const emailVo = Email.create(input.email).getValue()!;
  let user = existingUsers.find((candidate) => candidate.email.equals(emailVo));

  if (!user) {
    user = User.create({
      organizationId: input.organizationId,
      email: emailVo,
      createdBy: BOOTSTRAP_SYSTEM_ID,
    }).getValue()!;
    user.activate(BOOTSTRAP_SYSTEM_ID);
    user.assignRole(input.roleId, BOOTSTRAP_SYSTEM_ID);
    await input.userRepository.save(user);
    console.log(`User criado: ${input.email} (${user.id.toString()})`);
  } else {
    console.log(`User já existia: ${input.email} (${user.id.toString()})`);
  }

  await setCredential(prisma, input.email, input.password);
  console.log(`Credencial gravada para: ${input.email}`);
}

main()
  .catch((error) => {
    console.error("Seed falhou:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
