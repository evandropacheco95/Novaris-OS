import type { GoogleAdsCampaignRow, GoogleAdsAdGroupRef } from "@novaris/integration-hub";
import type { CsvKeywordRow } from "../../application/shared/advertising-row-upsert.js";
import { parsePtBrNumber, type ParsedGoogleAdsCsv } from "./google-ads-csv-parser.js";

/**
 * google-ads-csv-column-map.ts — mapeamento de headers PT-BR dos 3 relatórios
 * exportados pela UI do Google Ads (confirmado com exports reais da conta
 * Winnet, 2026-09-02: `Performance da campanha.csv`, `Performance do grupo
 * de anúncios.csv`, `Palavra-chave de pesquisa.csv`) para os tipos de linha
 * do `GoogleAdsProvider` (`@novaris/integration-hub`), reaproveitados como
 * estão — evita hierarquia de tipos paralela entre sync ao vivo e import CSV.
 *
 * Campanha e grupo de anúncios precisam das colunas `ID da campanha`/`ID do
 * grupo de anúncios` habilitadas no construtor de relatórios do Google Ads
 * (ausentes por padrão) — sem elas, `columnIndex` lança erro descritivo em
 * vez de inventar um `externalId`. O relatório de palavra-chave não traz
 * `ID do grupo de anúncios`; o vínculo é resolvido por nome
 * (`upsertKeywordsByAdGroupName`, `advertising-row-upsert.ts`).
 */

function columnIndex(headers: string[], name: string): number {
  const index = headers.indexOf(name);
  if (index === -1) {
    throw new Error(`Coluna obrigatória "${name}" não encontrada no CSV do Google Ads (colunas presentes: ${headers.join(", ")})`);
  }
  return index;
}

function cell(row: string[], index: number): string {
  return (row[index] ?? "").trim();
}

function translateLabel(map: Record<string, string>, raw: string): string {
  return map[raw.toLowerCase()] ?? raw;
}

/** `Estado da campanha`/`Status do grupo de anúncios` — mesmo vocabulário PT-BR nos dois relatórios. */
const STATUS_LABELS: Record<string, string> = {
  "ativada": "ENABLED",
  "ativado": "ENABLED",
  "pausada": "PAUSED",
  "pausado": "PAUSED",
  "removida": "REMOVED",
  "removido": "REMOVED",
};

/** `Tipo de campanha` — cobre os valores vistos no export real + tipos comuns do Google Ads. */
const CHANNEL_TYPE_LABELS: Record<string, string> = {
  "pesquisa": "SEARCH",
  "display": "DISPLAY",
  "shopping": "SHOPPING",
  "performance max": "PERFORMANCE_MAX",
  "vídeo": "VIDEO",
  "demand gen": "DEMAND_GEN",
  "local": "LOCAL",
  "inteligente": "SMART",
};

/** `Pesquisar tipo de correspondência de palavra-chave`. */
const MATCH_TYPE_LABELS: Record<string, string> = {
  "correspondência ampla": "BROAD",
  "correspondência de frase": "PHRASE",
  "correspondência exata": "EXACT",
};

export function mapCampaignCsvRows(csv: ParsedGoogleAdsCsv): GoogleAdsCampaignRow[] {
  const nameIdx = columnIndex(csv.headers, "Campanha");
  const statusIdx = columnIndex(csv.headers, "Estado da campanha");
  const channelTypeIdx = columnIndex(csv.headers, "Tipo de campanha");
  const externalIdIdx = columnIndex(csv.headers, "ID da campanha");
  const clicksIdx = columnIndex(csv.headers, "Cliques");
  const impressionsIdx = columnIndex(csv.headers, "Impr.");
  const conversionsIdx = columnIndex(csv.headers, "Conversões");
  const costIdx = columnIndex(csv.headers, "Custo");

  return csv.rows.map((row) => ({
    externalCampaignId: cell(row, externalIdIdx),
    name: cell(row, nameIdx),
    status: translateLabel(STATUS_LABELS, cell(row, statusIdx)),
    channelType: translateLabel(CHANNEL_TYPE_LABELS, cell(row, channelTypeIdx)),
    costMicros: Math.round(parsePtBrNumber(row[costIdx]) * 1_000_000),
    clicks: Math.round(parsePtBrNumber(row[clicksIdx])),
    impressions: Math.round(parsePtBrNumber(row[impressionsIdx])),
    conversions: parsePtBrNumber(row[conversionsIdx]),
  }));
}

export function mapAdGroupCsvRows(csv: ParsedGoogleAdsCsv): GoogleAdsAdGroupRef[] {
  const nameIdx = columnIndex(csv.headers, "Grupo de anúncios");
  const statusIdx = columnIndex(csv.headers, "Status do grupo de anúncios");
  const externalCampaignIdIdx = columnIndex(csv.headers, "ID da campanha");
  const externalAdGroupIdIdx = columnIndex(csv.headers, "ID do grupo de anúncios");

  return csv.rows.map((row) => ({
    externalAdGroupId: cell(row, externalAdGroupIdIdx),
    externalCampaignId: cell(row, externalCampaignIdIdx),
    name: cell(row, nameIdx),
    status: translateLabel(STATUS_LABELS, cell(row, statusIdx)),
  }));
}

export function mapKeywordCsvRows(csv: ParsedGoogleAdsCsv): CsvKeywordRow[] {
  const textIdx = columnIndex(csv.headers, "Pesquisar palavra-chave");
  const statusIdx = columnIndex(csv.headers, "Status da palavra-chave da rede de pesquisa");
  const matchTypeIdx = columnIndex(csv.headers, "Pesquisar tipo de correspondência de palavra-chave");
  const adGroupNameIdx = columnIndex(csv.headers, "Grupo de anúncios");
  const externalCriterionIdIdx = columnIndex(csv.headers, "ID da palavra-chave");
  const clicksIdx = columnIndex(csv.headers, "Cliques");
  const impressionsIdx = columnIndex(csv.headers, "Impr.");
  const costIdx = columnIndex(csv.headers, "Custo");

  return csv.rows.map((row) => ({
    externalCriterionId: cell(row, externalCriterionIdIdx),
    adGroupName: cell(row, adGroupNameIdx),
    text: cell(row, textIdx),
    matchType: translateLabel(MATCH_TYPE_LABELS, cell(row, matchTypeIdx)),
    // "Status da palavra-chave da rede de pesquisa" reflete elegibilidade de
    // veiculação (ex. "Qualificado"/"Limitado"), não o enum
    // ENABLED/PAUSED/REMOVED que `ad_group_criterion.status` retorna via API
    // — não fabricamos correspondência entre os dois vocabulários, mantemos
    // o rótulo original do Google Ads como veio.
    status: cell(row, statusIdx),
    costMicros: Math.round(parsePtBrNumber(row[costIdx]) * 1_000_000),
    clicks: Math.round(parsePtBrNumber(row[clicksIdx])),
    impressions: Math.round(parsePtBrNumber(row[impressionsIdx])),
  }));
}
