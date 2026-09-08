import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseGoogleAdsCsv, parsePtBrNumber, parseGoogleAdsDateRangeLabel } from "../../../infrastructure/csv/google-ads-csv-parser.js";

const CAMPAIGN_CSV_WITH_TOTAL =
  'Performance da campanha\n' +
  '1 de agosto de 2026 - 31 de agosto de 2026\n' +
  '"Campanha","ID da campanha","Estado da campanha","Cliques","Custo"\n' +
  '"Campanha A, Institucional","12345","Ativada","10","29,16"\n' +
  '"Campanha B","67890","Pausada","0"," --"\n' +
  'Total: Conta,,,10,"29,16"\n';

const CAMPAIGN_CSV_WITHOUT_TOTAL =
  'Performance da campanha\n' +
  '1 de agosto de 2026 - 31 de agosto de 2026\n' +
  '"Campanha","ID da campanha","Estado da campanha","Cliques","Custo"\n' +
  '"Campanha A","12345","Ativada","10","29,16"\n';

describe("parseGoogleAdsCsv", () => {
  it("separa título, intervalo de datas, header e linhas de dado", () => {
    const parsed = parseGoogleAdsCsv(CAMPAIGN_CSV_WITH_TOTAL);
    assert.equal(parsed.reportTitle, "Performance da campanha");
    assert.equal(parsed.dateRangeLabel, "1 de agosto de 2026 - 31 de agosto de 2026");
    assert.deepEqual(parsed.headers, ["Campanha", "ID da campanha", "Estado da campanha", "Cliques", "Custo"]);
    assert.equal(parsed.rows.length, 2);
  });

  it("respeita vírgulas dentro de campos entre aspas", () => {
    const parsed = parseGoogleAdsCsv(CAMPAIGN_CSV_WITH_TOTAL);
    assert.equal(parsed.rows[0]?.[0], "Campanha A, Institucional");
  });

  it("descarta linhas finais 'Total: ...'", () => {
    const parsed = parseGoogleAdsCsv(CAMPAIGN_CSV_WITH_TOTAL);
    assert.equal(
      parsed.rows.some((row) => row[0]?.startsWith("Total:")),
      false,
    );
  });

  it("funciona sem linhas 'Total: ...' (export termina em branco)", () => {
    const parsed = parseGoogleAdsCsv(CAMPAIGN_CSV_WITHOUT_TOTAL);
    assert.equal(parsed.rows.length, 1);
  });

  it("lança erro descritivo quando o CSV tem menos de 3 linhas", () => {
    assert.throws(() => parseGoogleAdsCsv("só uma linha"), /esperado ao menos 3 linhas/);
  });
});

describe("parsePtBrNumber", () => {
  it("converte decimal com vírgula e milhar com ponto", () => {
    assert.equal(parsePtBrNumber("13.048,50"), 13048.5);
  });

  it("trata ausência de valor ('--') como 0", () => {
    assert.equal(parsePtBrNumber(" --"), 0);
    assert.equal(parsePtBrNumber(undefined), 0);
  });

  it("remove sufixo de percentual", () => {
    assert.equal(parsePtBrNumber("29,16%"), 29.16);
  });
});

describe("parseGoogleAdsDateRangeLabel", () => {
  it("parseia o formato PT-BR confirmado no export real", () => {
    const result = parseGoogleAdsDateRangeLabel("1 de agosto de 2026 - 31 de agosto de 2026");
    assert.ok(result);
    assert.equal(result?.startDate.toISOString(), new Date(Date.UTC(2026, 7, 1)).toISOString());
    assert.equal(result?.endDate.toISOString(), new Date(Date.UTC(2026, 7, 31)).toISOString());
  });

  it("retorna null para formatos não reconhecidos", () => {
    assert.equal(parseGoogleAdsDateRangeLabel("formato desconhecido"), null);
  });
});
