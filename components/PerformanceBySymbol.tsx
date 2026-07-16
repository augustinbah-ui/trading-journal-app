import { Trade } from "@/types/database";
import clsx from "clsx";

export default function PerformanceBySymbol({ trades }: { trades: Trade[] }) {
  const bySymbol = trades.reduce<Record<string, { count: number; pnl: number }>>((acc, t) => {
    if (!acc[t.symbol]) acc[t.symbol] = { count: 0, pnl: 0 };
    acc[t.symbol].count += 1;
    acc[t.symbol].pnl += t.result_amount ?? 0;
    return acc;
  }, {});

  const rows = Object.entries(bySymbol).sort((a, b) => b[1].pnl - a[1].pnl);

  if (rows.length === 0) {
    return <p className="text-sm text-textSecondary">Pas encore de données.</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map(([symbol, data]) => (
        <div key={symbol} className="flex items-center justify-between py-1.5 text-sm">
          <div>
            <span className="font-medium">{symbol}</span>
            <span className="ml-2 text-xs text-textSecondary">{data.count} trade(s)</span>
          </div>
          <span className={clsx("font-medium", data.pnl >= 0 ? "text-profit" : "text-loss")}>
            {data.pnl >= 0 ? "+" : ""}
            {data.pnl.toFixed(2)}R
          </span>
        </div>
      ))}
    </div>
  );
}
