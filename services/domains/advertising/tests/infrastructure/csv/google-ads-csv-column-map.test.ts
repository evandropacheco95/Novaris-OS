import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseGoogleAdsCsv } from "../../../infrastructure/csv/google-ads-csv-parser.js";
import { mapCampaignCsvRows, mapAdGroupCsvRows, mapKeywordCsvRows } from "../../../infrastructure/csv/google-ads-csv-column-map.js";

const CAMPAIGN_CSV =
  'Performance da campanha\n' +
  '1 de agosto de 2026 - 31 de agosto de 2026\n' +
  '"Campanha","ID da campanha","Estado da campanha","Tipo de campanha","Cliques","Impr.","Conversões","Custo"\n' +
  '"Campanha A","12345","Ativada","Pesquisa","10","100","2,5","29,16"\n';

const AD_GROUP_CSV =
  'Performance do grupo de anúncios\n' +
  '1 de agosto de 2026 - 31 de agosto de 2026\n' +
  '"Grupo de anúncios","ID do grupo de anúncios","ID da campanha","Status do grupo de anúncios"\n' +
  '"Grupo A","555","12345","Pausada"\n';

const KEYWORD_CSV =
  'Palavra-chave de pesquisa\n' +
  '1 de agosto de 2026 - 31 de agosto de 2026\n' +
  '"Pesquisar palavra-chave","ID da palavra-chave","Grupo de anúncios","Pesquisar tipo de correspondência de palavra-chave","Status da palavra-chave da rede de pesquisa","Cliques","Impr.","Custo"\n' +
  '"tenis corrida","999","Grupo A","Correspondência ampla","Qualificado","3","20","5,00"\n';

describe("mapCampaignCsvRows", () => {
  it("traduz status/tipo de canal PT-BR para o vocabulário GAQL e converte custo para micros", () => {
    const [row] = mapCampaignCsvRows(parseGoogleAdsCsv(CAMPAIGN_CSV));
    assert.equal(row?.externalCampaignId, "12345");
    assert.equal(row?.status, "ENABLED");
    assert.equal(row?.channelType, "SEARCH");
    assert.equal(row?.costMicros, 29_160_000);
    assert.equal(row?.clicks, 10);
    assert.equal(row?.conversions, 2.5);
  });

  it("lança erro descritivo quando falta a coluna 'ID da campanha'", () => {
    const csvSemId =
      'Performance da campanha\n1 de agosto de 2026 - 31 de agosto de 2026\n"Campanha","Estado da campanha","Tipo de campanha","Cliques","Impr.","Conversões","Custo"\n"Campanha A","Ativada","Pesquisa","10","100","2,5","29,16"\n';
    assert.throws(() => mapCampaignCsvRows(parseGoogleAdsCsv(csvSemId)), /ID da campanha/);
  });
});

describe("mapAdGroupCsvRows", () => {
  it("mapeia ID externo do grupo e da campanha pai", () => {
    const [row] = mapAdGroupCsvRows(parseGoogleAdsCsv(AD_GROUP_CSV));
    assert.equal(row?.externalAdGroupId, "555");
    assert.equal(row?.externalCampaignId, "12345");
    assert.equal(row?.status, "PAUSED");
  });
});

describe("mapKeywordCsvRows", () => {
  it("mapeia por nome do grupo de anúncios (sem ID externo) e traduz o match type", () => {
    const [row] = mapKeywordCsvRows(parseGoogleAdsCsv(KEYWORD_CSV));
    assert.equal(row?.adGroupName, "Grupo A");
    assert.equal(row?.matchType, "BROAD");
    assert.equal(row?.externalCriterionId, "999");
  });

  it("passa o status de elegibilidade de veiculação sem traduzir (vocabulário diferente de ENABLED/PAUSED/REMOVED)", () => {
    const [row] = mapKeywordCsvRows(parseGoogleAdsCsv(KEYWORD_CSV));
    assert.equal(row?.status, "Qualificado");
  });
});
