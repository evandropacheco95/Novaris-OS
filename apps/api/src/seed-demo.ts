import { UniqueEntityId, Result, DomainError } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { createOrganizationRepository } from "@novaris/organizations";
import { createUserRepository } from "@novaris/identity";
import {
  Party,
  Relationship,
  createPartyRepository,
  createRelationshipRepository,
  type Party as PartyType,
} from "@novaris/customer";
import {
  Lead,
  Opportunity,
  Pipeline,
  Stage,
  Product,
  SalesChannel,
  Quotation,
  Contract,
  Revenue,
  createLeadRepository,
  createOpportunityRepository,
  createPipelineRepository,
  createProductRepository,
  createSalesChannelRepository,
  createQuotationRepository,
  createContractRepository,
  createRevenueRepository,
} from "@novaris/sales";
import { Campaign, createCampaignRepository } from "@novaris/marketing";
import { Project, createProjectRepository } from "@novaris/projects";
import {
  Checklist,
  Comment,
  Reminder,
  Case,
  CalendarEvent,
  createChecklistRepository,
  createCommentRepository,
  createReminderRepository,
  createCaseRepository,
  createCalendarEventRepository,
} from "@novaris/activity";

/**
 * Seed de dados de demonstração (fictícios) — popula a Organization "novaris"
 * (já criada por `seed.ts`) com Parties/Leads/Opportunities/Quotations/etc.
 * realistas para exercitar a UI. Não toca em Users/Roles/credentials — isso
 * é responsabilidade exclusiva de `seed.ts`. Idempotente por checagem de
 * marcador (`DEMO_MARKER_PARTY_NAME`): rodar de novo não duplica nada.
 */
const DEMO_MARKER_PARTY_NAME = "Construtora Horizonte Ltda";

function unwrap<T>(result: Result<T, DomainError>): T {
  if (result.isFailure) {
    throw new Error(result.getError()!.message);
  }
  return result.getValue()!;
}

async function main(): Promise<void> {
  const organizationRepository = createOrganizationRepository(prisma);
  const userRepository = createUserRepository(prisma);
  const partyRepository = createPartyRepository(prisma);
  const relationshipRepository = createRelationshipRepository(prisma);
  const leadRepository = createLeadRepository(prisma);
  const opportunityRepository = createOpportunityRepository(prisma);
  const pipelineRepository = createPipelineRepository(prisma);
  const productRepository = createProductRepository(prisma);
  const salesChannelRepository = createSalesChannelRepository(prisma);
  const quotationRepository = createQuotationRepository(prisma);
  const contractRepository = createContractRepository(prisma);
  const revenueRepository = createRevenueRepository(prisma);
  const campaignRepository = createCampaignRepository(prisma);
  const projectRepository = createProjectRepository(prisma);
  const checklistRepository = createChecklistRepository(prisma);
  const commentRepository = createCommentRepository(prisma);
  const reminderRepository = createReminderRepository(prisma);
  const caseRepository = createCaseRepository(prisma);
  const calendarEventRepository = createCalendarEventRepository(prisma);

  const organizations = unwrap(await organizationRepository.findAll());
  const organization = organizations.find((org) => org.slug === "novaris");
  if (!organization) {
    throw new Error('Organization "novaris" não existe — rode "node dist/seed.js" primeiro.');
  }
  const organizationId = organization.id;

  const users = unwrap(await userRepository.findAll());
  const actor = users.find((u) => u.email.value === "evandrinhop@gmail.com");
  if (!actor) {
    throw new Error('User "evandrinhop@gmail.com" não existe — rode "node dist/seed.js" primeiro.');
  }
  const actorId = actor.id;

  const existingParties = unwrap(await partyRepository.findAll());
  if (existingParties.some((p) => p.name === DEMO_MARKER_PARTY_NAME)) {
    console.log("Dados de demonstração já existem — nada a fazer.");
    return;
  }

  // 1. Parties
  const partyInputs: Array<{ partyType: "person" | "external_organization"; name: string; document?: string }> = [
    { partyType: "external_organization", name: DEMO_MARKER_PARTY_NAME, document: "12.345.678/0001-90" },
    { partyType: "person", name: "Fernanda Albuquerque", document: "123.456.789-01" },
    { partyType: "external_organization", name: "Distribuidora Vale Verde S.A.", document: "23.456.789/0001-11" },
    { partyType: "person", name: "Ricardo Nakamura", document: "234.567.890-12" },
    { partyType: "external_organization", name: "Studio Criativo Âmbar", document: "34.567.890/0001-22" },
    { partyType: "person", name: "Juliana Prado", document: "345.678.901-23" },
    { partyType: "external_organization", name: "Metalúrgica São Bento Ltda", document: "45.678.901/0001-33" },
    { partyType: "person", name: "Bruno Castellani", document: "456.789.012-34" },
  ];
  const parties: PartyType[] = [];
  for (const input of partyInputs) {
    const party = unwrap(Party.create({ organizationId, ...input }));
    unwrap(await partyRepository.save(party));
    parties.push(party);
  }
  const horizonte = parties[0]!;
  const fernanda = parties[1]!;
  const valeVerde = parties[2]!;
  const ricardo = parties[3]!;
  const ambar = parties[4]!;
  const juliana = parties[5]!;
  const saoBento = parties[6]!;
  const bruno = parties[7]!;
  console.log(`${parties.length} Parties criadas.`);

  // 2. Relationships
  const relationshipInputs: Array<[PartyType, PartyType, Relationship["type"]]> = [
    [fernanda, horizonte, "colaborador"],
    [ricardo, valeVerde, "colaborador"],
    [horizonte, ambar, "parceiro"],
    [juliana, saoBento, "colaborador"],
    [valeVerde, horizonte, "fornecedor"],
  ];
  for (const [partyIdA, partyIdB, type] of relationshipInputs) {
    const relationship = unwrap(Relationship.create({ organizationId, partyIdA: partyIdA.id, partyIdB: partyIdB.id, type }));
    unwrap(await relationshipRepository.save(relationship));
  }
  console.log(`${relationshipInputs.length} Relationships criadas.`);

  // 3. Sales Channels
  const directChannel = unwrap(SalesChannel.create({ organizationId, name: "Vendas Diretas", type: "direct" }));
  unwrap(await salesChannelRepository.save(directChannel));
  const onlineChannel = unwrap(SalesChannel.create({ organizationId, name: "Loja Online", type: "online_store" }));
  unwrap(await salesChannelRepository.save(onlineChannel));
  console.log("2 Sales Channels criados.");

  // 4. Products
  const productInputs = [
    { name: "Licença NOVARIS Starter", unitPrice: 490 },
    { name: "Licença NOVARIS Business", unitPrice: 1290 },
    { name: "Licença NOVARIS Enterprise", unitPrice: 3990 },
    { name: "Implantação Onboarding", unitPrice: 2500 },
    { name: "Suporte Premium Mensal", unitPrice: 690 },
  ];
  const products: Product[] = [];
  for (const input of productInputs) {
    const product = unwrap(Product.create({ organizationId, ...input }));
    unwrap(await productRepository.save(product));
    products.push(product);
  }
  console.log(`${products.length} Products criados.`);

  // 5. Pipeline + Stages
  const pipeline = unwrap(Pipeline.create({ organizationId, name: "Pipeline Comercial" }));
  const stageNames = ["Prospecção", "Qualificação", "Proposta", "Negociação", "Fechamento"];
  stageNames.forEach((name, order) => {
    const stage = unwrap(Stage.create({ name, order }));
    unwrap(pipeline.addStage(stage));
  });
  unwrap(await pipelineRepository.save(pipeline));
  const stages = pipeline.getStages();
  console.log(`1 Pipeline com ${stages.length} Stages criada.`);

  // 6. Leads
  const leadInputs = [
    { name: "Marcos Vinícius Teles", email: "marcos.teles@email.com", company: "Teles Consultoria", source: "site" },
    { name: "Patrícia Gonçalves", email: "patricia.g@email.com", company: "Gonçalves Advocacia", source: "indicação" },
    { name: "André Salomão", email: "andre.salomao@email.com", company: "Salomão Engenharia", source: "evento" },
    { name: "Camila Duarte", email: "camila.duarte@email.com", company: "Duarte Contabilidade", source: "site" },
    { name: "Thiago Barros", email: "thiago.barros@email.com", company: "Barros Logística", source: "indicação" },
    { name: "Larissa Monteiro", email: "larissa.m@email.com", company: "Monteiro Design", source: "redes sociais" },
  ];
  const leads: Lead[] = [];
  for (const input of leadInputs) {
    const lead = unwrap(Lead.create({ organizationId, ...input }));
    leads.push(lead);
  }
  unwrap(leads[1]!.updateStatus("contacted"));
  unwrap(leads[2]!.updateStatus("qualified"));
  unwrap(leads[3]!.updateStatus("unqualified"));
  unwrap(leads[4]!.updateStatus("contacted"));
  for (const lead of leads) {
    unwrap(await leadRepository.save(lead));
  }
  console.log(`${leads.length} Leads criados.`);

  // 7. Opportunities
  const opportunityInputs: Array<{ party: PartyType; stageIndex: number; channel: SalesChannel; outcome?: "won" | "lost" }> = [
    { party: horizonte, stageIndex: 4, channel: directChannel, outcome: "won" },
    { party: valeVerde, stageIndex: 2, channel: directChannel },
    { party: ambar, stageIndex: 1, channel: onlineChannel },
    { party: saoBento, stageIndex: 3, channel: directChannel },
    { party: fernanda, stageIndex: 0, channel: onlineChannel },
    { party: ricardo, stageIndex: 4, channel: directChannel, outcome: "lost" },
  ];
  const opportunities: Opportunity[] = [];
  for (const input of opportunityInputs) {
    const opportunity = unwrap(
      Opportunity.create({
        organizationId,
        partyId: input.party.id,
        pipelineId: pipeline.id,
        currentStageId: stages[input.stageIndex]!.id,
        salesChannelId: input.channel.id,
      }),
    );
    if (input.outcome === "won") unwrap(opportunity.markWon());
    if (input.outcome === "lost") unwrap(opportunity.markLost());
    unwrap(await opportunityRepository.save(opportunity));
    opportunities.push(opportunity);
  }
  console.log(`${opportunities.length} Opportunities criadas.`);

  // 8. Quotations (opportunities[0] = Horizonte, won) + line items + Contract + Revenue
  const wonOpportunity = opportunities[0]!;
  const quotationDraft = unwrap(Quotation.create({ organizationId, opportunityId: opportunities[1]!.id }));
  unwrap(quotationDraft.addLineItem({ productId: products[0]!.id, quantity: 2, unitPrice: products[0]!.unitPrice }));
  unwrap(await quotationRepository.save(quotationDraft));

  const quotationSent = unwrap(Quotation.create({ organizationId, opportunityId: opportunities[2]!.id }));
  unwrap(quotationSent.addLineItem({ productId: products[1]!.id, quantity: 1, unitPrice: products[1]!.unitPrice }));
  unwrap(quotationSent.addLineItem({ productId: products[3]!.id, quantity: 1, unitPrice: products[3]!.unitPrice }));
  unwrap(quotationSent.send());
  unwrap(await quotationRepository.save(quotationSent));

  const quotationAccepted = unwrap(Quotation.create({ organizationId, opportunityId: wonOpportunity.id }));
  unwrap(quotationAccepted.addLineItem({ productId: products[2]!.id, quantity: 1, unitPrice: products[2]!.unitPrice }));
  unwrap(quotationAccepted.addLineItem({ productId: products[4]!.id, quantity: 12, unitPrice: products[4]!.unitPrice }));
  unwrap(quotationAccepted.send());
  unwrap(quotationAccepted.accept());
  unwrap(await quotationRepository.save(quotationAccepted));
  console.log("3 Quotations criadas (draft/sent/accepted).");

  const now = new Date();
  const oneYearLater = new Date(now.getTime());
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const contract = unwrap(
    Contract.create({
      organizationId,
      opportunityId: wonOpportunity.id,
      quotationId: quotationAccepted.id,
      startDate: now,
      endDate: oneYearLater,
    }),
  );
  unwrap(await contractRepository.save(contract));
  console.log("1 Contract criado a partir da Quotation aceita.");

  const revenueOne = unwrap(Revenue.create({ organizationId, contractId: contract.id, amount: 3990, currency: "BRL" }));
  unwrap(await revenueRepository.save(revenueOne));
  const revenueTwo = unwrap(Revenue.create({ organizationId, contractId: contract.id, amount: 690 * 12, currency: "BRL" }));
  unwrap(await revenueRepository.save(revenueTwo));
  console.log("2 Revenues reconhecidas a partir do Contract.");

  // 9. Campaigns
  const campaignInputs = [
    { name: "Campanha de Lançamento NOVARIS", startDate: new Date("2026-06-01"), endDate: new Date("2026-08-31") },
    { name: "Webinar Automação Comercial", startDate: new Date("2026-09-10") },
    { name: "Black Friday B2B 2026", startDate: new Date("2026-11-20"), endDate: new Date("2026-11-30") },
  ];
  for (const input of campaignInputs) {
    const campaign = unwrap(Campaign.create({ organizationId, ...input }));
    unwrap(await campaignRepository.save(campaign));
  }
  console.log(`${campaignInputs.length} Campaigns criadas.`);

  // 10. Projects + Tasks
  const projectOne = unwrap(Project.create({ organizationId, name: "Implantação Construtora Horizonte" }));
  [
    { title: "Levantamento de requisitos" },
    { title: "Configuração do ambiente" },
    { title: "Treinamento da equipe" },
    { title: "Go-live" },
  ].forEach((t) => unwrap(projectOne.addTask(t)));
  unwrap(await projectRepository.save(projectOne));

  const projectTwo = unwrap(Project.create({ organizationId, name: "Integração Metalúrgica São Bento" }));
  [{ title: "Mapeamento fiscal (NCM/CFOP)" }, { title: "Migração de cadastro de Produtos" }].forEach((t) =>
    unwrap(projectTwo.addTask(t)),
  );
  unwrap(await projectRepository.save(projectTwo));
  console.log("2 Projects com Tasks criados.");

  // 11. Checklists
  const checklistOne = unwrap(Checklist.create({ organizationId, partyId: horizonte.id, title: "Onboarding Construtora Horizonte" }));
  ["Assinatura de contrato", "Criação de usuários", "Configuração inicial"].forEach((label) =>
    unwrap(checklistOne.addItem(label)),
  );
  unwrap(await checklistRepository.save(checklistOne));

  const checklistTwo = unwrap(Checklist.create({ organizationId, partyId: valeVerde.id, title: "Due diligence Vale Verde" }));
  ["Validar documentação fiscal", "Aprovar limite de crédito"].forEach((label) => unwrap(checklistTwo.addItem(label)));
  unwrap(await checklistRepository.save(checklistTwo));
  console.log("2 Checklists criados.");

  // 12. Comments (polimórfico, sobre Leads e Opportunities)
  const commentInputs = [
    { targetType: "lead", targetId: leads[0]!.id, body: "Retornar contato até sexta-feira." },
    { targetType: "lead", targetId: leads[2]!.id, body: "Lead qualificado — encaminhar proposta." },
    { targetType: "opportunity", targetId: wonOpportunity.id, body: "Fechamento comemorado com o cliente." },
    { targetType: "opportunity", targetId: opportunities[1]!.id, body: "Aguardando aprovação orçamentária do cliente." },
  ];
  for (const input of commentInputs) {
    const comment = unwrap(Comment.create({ organizationId, authorUserId: actorId, ...input }));
    unwrap(await commentRepository.save(comment));
  }
  console.log(`${commentInputs.length} Comments criados.`);

  // 13. Reminders
  const inDays = (days: number): Date => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const reminderInputs = [
    { partyId: fernanda.id, message: "Ligar para confirmar reunião de kickoff.", remindAt: inDays(2) },
    { partyId: ricardo.id, message: "Enviar follow-up da proposta.", remindAt: inDays(3) },
    { partyId: juliana.id, message: "Renovação de contrato se aproximando.", remindAt: inDays(20) },
    { partyId: bruno.id, message: "Validar dados cadastrais.", remindAt: inDays(5) },
  ];
  for (const input of reminderInputs) {
    const reminder = unwrap(Reminder.create({ organizationId, ...input }));
    unwrap(await reminderRepository.save(reminder));
  }
  console.log(`${reminderInputs.length} Reminders criados.`);

  // 14. Cases
  const caseInputs: Array<{ partyId: UniqueEntityId; subject: string; description?: string; priority: "low" | "medium" | "high" }> = [
    { partyId: horizonte.id, subject: "Erro ao gerar relatório mensal", priority: "high", description: "Relatório não carrega para o mês de julho." },
    { partyId: valeVerde.id, subject: "Dúvida sobre faturamento", priority: "low" },
    { partyId: ambar.id, subject: "Solicitação de novo usuário", priority: "medium" },
    { partyId: saoBento.id, subject: "Lentidão no módulo de Products", priority: "medium" },
  ];
  for (const input of caseInputs) {
    const caseInstance = unwrap(Case.create({ organizationId, ...input }));
    unwrap(await caseRepository.save(caseInstance));
  }
  console.log(`${caseInputs.length} Cases criados.`);

  // 15. Calendar Events
  const calendarEventInputs = [
    { partyId: horizonte.id, subject: "Reunião de acompanhamento mensal", startAt: inDays(4), endAt: inDays(4) },
    { partyId: valeVerde.id, subject: "Apresentação de proposta comercial", startAt: inDays(6), endAt: inDays(6) },
    { partyId: ambar.id, subject: "Treinamento da equipe", startAt: inDays(10), endAt: inDays(10) },
  ];
  for (const input of calendarEventInputs) {
    input.endAt = new Date(input.endAt.getTime() + 60 * 60 * 1000);
    const event = unwrap(CalendarEvent.create({ organizationId, ...input }));
    unwrap(await calendarEventRepository.save(event));
  }
  console.log(`${calendarEventInputs.length} Calendar Events criados.`);

  console.log("Seed de demonstração concluído.");
}

main()
  .catch((error) => {
    console.error("Seed de demonstração falhou:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
