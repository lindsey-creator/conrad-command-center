/** Minimal CSV parser for shadow-validation uploads (no dependencies). */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function csvRowsToDeals(rows: Record<string, string>[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const get = (...keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== '') return row[k];
        const lower = Object.keys(row).find(
          (rk) => rk.toLowerCase() === k.toLowerCase(),
        );
        if (lower && row[lower]) return row[lower];
      }
      return '';
    };
    return {
      address: get('address'),
      purchase_price: num(get('purchase_price')),
      arv: num(get('arv')),
      rehab_estimate: num(get('rehab_estimate')),
      monthly_rent: num(get('monthly_rent')),
      monthly_debt_service: num(get('monthly_debt_service')),
      other_costs: num(get('other_costs')),
      verdict: get('verdict'),
      reasoning: get('reasoning'),
    };
  });
}

function num(v: string): number {
  const n = parseFloat(v.replace(/[$,]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
