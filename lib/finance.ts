import { query, type Row } from "./db";
import type { MonthSummary, Transaction, TxKind } from "./money";

export {
  TARGET_BULANAN,
  KATEGORI_MASUK,
  KATEGORI_KELUAR,
  formatRupiah,
  formatMonth,
} from "./money";
export type { MonthSummary, Transaction, TxKind } from "./money";

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function rowToTransaction(row: Row): Transaction {
  return {
    id: row.id as string,
    kind: row.kind as TxKind,
    // BIGINT arrives as a string from the driver; Number keeps it usable and
    // rupiah totals stay far below the safe-integer limit.
    amount: Number(row.amount),
    category: row.category as string,
    venture: (row.venture as string | null) ?? null,
    note: (row.note as string | null) ?? null,
    occurredOn: toDateString(row.occurred_on),
  };
}

export async function createTransaction(input: {
  kind: TxKind;
  amount: number;
  category: string;
  venture?: string | null;
  note?: string | null;
  occurredOn: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO transactions (id, kind, amount, category, venture, note, occurred_on)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      input.kind,
      Math.round(input.amount),
      input.category,
      input.venture || null,
      input.note || null,
      input.occurredOn,
    ],
  );
  return id;
}

export async function deleteTransaction(id: string): Promise<void> {
  await query("DELETE FROM transactions WHERE id = $1", [id]);
}

export async function listTransactions(limit = 100): Promise<Transaction[]> {
  const rows = await query(
    "SELECT * FROM transactions ORDER BY occurred_on DESC, created_at DESC LIMIT $1",
    [limit],
  );
  return rows.map(rowToTransaction);
}

/** Totals for the last `months` calendar months, newest first. */
export async function monthlySummaries(months = 6): Promise<MonthSummary[]> {
  const rows = await query(
    `SELECT to_char(date_trunc('month', occurred_on), 'YYYY-MM') AS month,
            COALESCE(SUM(amount) FILTER (WHERE kind = 'masuk'), 0)  AS masuk,
            COALESCE(SUM(amount) FILTER (WHERE kind = 'keluar'), 0) AS keluar
       FROM transactions
      WHERE occurred_on >= date_trunc('month', CURRENT_DATE) - ($1::int - 1) * INTERVAL '1 month'
      GROUP BY 1
      ORDER BY 1 DESC`,
    [String(months)],
  );

  return rows.map((row) => {
    const masuk = Number(row.masuk);
    const keluar = Number(row.keluar);
    return { month: row.month as string, masuk, keluar, bersih: masuk - keluar };
  });
}

export type VentureTotal = { venture: string; masuk: number };

/** Income per venture for the current month — which stream is actually paying. */
export async function ventureTotalsThisMonth(): Promise<VentureTotal[]> {
  const rows = await query(
    `SELECT COALESCE(NULLIF(venture, ''), 'Tanpa label') AS venture,
            SUM(amount) AS masuk
       FROM transactions
      WHERE kind = 'masuk'
        AND occurred_on >= date_trunc('month', CURRENT_DATE)
      GROUP BY 1
      ORDER BY 2 DESC`,
  );
  return rows.map((row) => ({
    venture: row.venture as string,
    masuk: Number(row.masuk),
  }));
}
