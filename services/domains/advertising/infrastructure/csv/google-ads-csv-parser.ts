/**
 * google-ads-csv-parser.ts — parser genérico (sem dependência externa) para
 * relatórios exportados pela própria UI do Google Ads (Fase 02, import
 * manual de CSV). Formato confirmado com exports reais da conta Winnet
 * (locale PT-BR, 2026-09-02): linha 1 = título do relatório, linha 2 =
 * intervalo de datas, linha 3 = header real, depois linhas de dado. Alguns
 * exports trazem linhas finais `Total: <algo>` (uma por segmentação, ex.
 * `Total: Conta`) que não são dado de linha e precisam ser descartadas;
 * outros (confirmado nos exports mais recentes) terminam só com linha em
 * branco — o parser trata os dois casos.
 *
 * RFC4180-aware feito à mão (não `naive split(",")`) porque nomes de
 * campanha/grupo de anúncios comumente contêm vírgulas dentro de campos
 * entre aspas.
 */

const BOM = "﻿";

/** Tokeniza o CSV inteiro em linhas de campos, respeitando aspas (inclusive quebras de linha dentro de campo entre aspas e `""` como aspas escapada). */
function tokenizeCsv(raw: string): string[][] {
  const text = raw.startsWith(BOM) ? raw.slice(1) : raw;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // ignorado — tratado junto do \n
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  // última linha sem newline final
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export interface ParsedGoogleAdsCsv {
  reportTitle: string;
  dateRangeLabel: string;
  headers: string[];
  /** Linhas de dado já sem o preâmbulo (título+intervalo+header) e sem as linhas `Total: ...`. */
  rows: string[][];
}

export function parseGoogleAdsCsv(raw: string): ParsedGoogleAdsCsv {
  const allRows = tokenizeCsv(raw).filter((row) => !(row.length === 1 && row[0]?.trim() === ""));
  if (allRows.length < 3) {
    throw new Error('CSV do Google Ads inválido: esperado ao menos 3 linhas (título, intervalo de datas, header)');
  }

  const [titleRow, dateRangeRow, headerRow, ...dataRows] = allRows as [string[], string[], string[], ...string[][]];
  const rows = dataRows.filter((row) => !row[0]?.trim().startsWith("Total:"));

  return {
    reportTitle: titleRow[0]?.trim() ?? "",
    dateRangeLabel: dateRangeRow[0]?.trim() ?? "",
    headers: headerRow.map((header) => header.trim()),
    rows,
  };
}

/** Converte um número no formato PT-BR do Google Ads (`"13.048"`, `"29,16"`, `" --"`) para `number`. Ausência de valor (`--`) vira `0`. */
export function parsePtBrNumber(raw: string | undefined): number {
  const trimmed = (raw ?? "").trim();
  if (trimmed === "" || trimmed === "--" || trimmed === "-") {
    return 0;
  }
  const normalized = trimmed.replace(/\./g, "").replace(",", ".").replace("%", "");
  const value = Number.parseFloat(normalized);
  return Number.isNaN(value) ? 0 : value;
}

const PT_BR_MONTHS: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

/** Parseia `"1 de agosto de 2026 - 31 de agosto de 2026"` (formato confirmado no export real). Outros locales retornam `null` — caller decide como reagir. */
export function parseGoogleAdsDateRangeLabel(label: string): { startDate: Date; endDate: Date } | null {
  const parts = label.split(" - ").map((part) => part.trim());
  if (parts.length !== 2) {
    return null;
  }

  const parseOne = (part: string): Date | null => {
    const match = /^(\d{1,2}) de ([a-zç]+) de (\d{4})$/iu.exec(part);
    if (!match) {
      return null;
    }
    const day = Number.parseInt(match[1]!, 10);
    const month = PT_BR_MONTHS[match[2]!.toLowerCase()];
    const year = Number.parseInt(match[3]!, 10);
    if (month === undefined) {
      return null;
    }
    return new Date(Date.UTC(year, month, day));
  };

  const startDate = parseOne(parts[0]!);
  const endDate = parseOne(parts[1]!);
  if (!startDate || !endDate) {
    return null;
  }
  return { startDate, endDate };
}
