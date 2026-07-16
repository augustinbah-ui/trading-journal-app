import { Trade } from "@/types/database";

export function getClosedTrades(trades: Trade[]) {
  return trades.filter((t) => t.status === "closed" && t.result_amount !== null);
}

export function calcWinRate(trades: Trade[]): number {
  const closed = getClosedTrades(trades);
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => (t.result_amount ?? 0) > 0).length;
  return (wins / closed.length) * 100;
}

// Somme des R gagnés/perdus sur l'ensemble des trades clôturés
export function calcTotalR(trades: Trade[]): number {
  return getClosedTrades(trades).reduce((sum, t) => sum + (t.result_amount ?? 0), 0);
}

// RR moyen théorique (basé sur stop-loss / take-profit visés, avant le trade)
export function calcAverageRR(trades: Trade[]): number {
  const closed = getClosedTrades(trades).filter((t) => t.stop_loss && t.take_profit);
  if (closed.length === 0) return 0;

  const ratios = closed.map((t) => {
    const risk = Math.abs(t.entry_price - (t.stop_loss ?? 0));
    const reward = Math.abs((t.take_profit ?? 0) - t.entry_price);
    return risk > 0 ? reward / risk : 0;
  });

  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

// Drawdown maximum, exprimé en R cumulés
export function calcMaxDrawdown(trades: Trade[]): number {
  const closed = getClosedTrades(trades).sort(
    (a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
  );

  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;

  for (const t of closed) {
    equity += t.result_amount ?? 0;
    peak = Math.max(peak, equity);
    const drawdown = peak - equity;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown;
}

// Courbe d'évolution en R cumulés (plus en devise)
export function buildEquityCurve(trades: Trade[], startingCapital: number) {
  const closed = getClosedTrades(trades).sort(
    (a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
  );

  let cumulativeR = 0;
  return closed.map((t) => {
    cumulativeR += t.result_amount ?? 0;
    return {
      date: t.exit_time ?? t.entry_time,
      equity: Math.round(cumulativeR * 100) / 100,
    };
  });
}

export function calcCurrentLossStreak(trades: Trade[]): number {
  const closed = getClosedTrades(trades).sort(
    (a, b) => new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
  );

  let streak = 0;
  for (const t of closed) {
    if ((t.result_amount ?? 0) < 0) streak++;
    else break;
  }
  return streak;
}

// Somme des R gagnés/perdus sur les trades clôturés aujourd'hui
export function calcTodayR(trades: Trade[]): number {
  const today = new Date().toDateString();
  return getClosedTrades(trades)
    .filter((t) => t.exit_time && new Date(t.exit_time).toDateString() === today)
    .reduce((sum, t) => sum + (t.result_amount ?? 0), 0);
}
