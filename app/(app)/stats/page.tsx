import { createClient } from "@/lib/supabase/server";
import { Trade, Profile, TradingAccount } from "@/types/database";
import {
  calcWinRate,
  calcTotalR,
  calcAverageRR,
  calcMaxDrawdown,
  buildEquityCurve,
  getClosedTrades,
} from "@/lib/stats";
import StatCard from "@/components/StatCard";
import EquityChart from "@/components/EquityChart";
import PerformanceBySymbol from "@/components/PerformanceBySymbol";
import AccountSelector from "@/components/AccountSelector";
import { Percent, TrendingUp, TrendingDown, Scale } from "lucide-react";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const selectedAccount = searchParams.account ?? "";

  const [{ data: profile }, { data: allTrades }, { data: accounts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("trades").select("*").eq("user_id", user!.id).order("entry_time"),
    supabase.from("trading_accounts").select("*").eq("user_id", user!.id),
  ]);

  const p = profile as Profile | null;
  const accountsList = (accounts as TradingAccount[]) ?? [];
  const t = ((allTrades as Trade[]) ?? []).filter(
    (trade) => !selectedAccount || trade.account_id === selectedAccount
  );
  const closed = getClosedTrades(t);

  const winRate = calcWinRate(t);
  const totalR = calcTotalR(t);
  const avgRR = calcAverageRR(t);
  const maxDD = calcMaxDrawdown(t);
  const equityCurve = buildEquityCurve(t, p?.starting_capital ?? 0);

  const wins = closed.filter((x) => (x.result_amount ?? 0) > 0).length;
  const losses = closed.filter((x) => (x.result_amount ?? 0) < 0).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="mb-6 text-xl font-semibold">Statistiques</h1>

      <AccountSelector accounts={accountsList} />

      {closed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-textSecondary">
          Clôturez des trades pour voir vos statistiques apparaître ici.
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="R total"
              value={`${totalR >= 0 ? "+" : ""}${totalR.toFixed(2)}R`}
              icon={totalR >= 0 ? TrendingUp : TrendingDown}
              tone={totalR >= 0 ? "positive" : "negative"}
            />
            <StatCard label="Win rate" value={`${winRate.toFixed(0)}%`} icon={Percent} />
            <StatCard label="R:R visé (moyen)" value={avgRR.toFixed(2)} icon={Scale} />
            <StatCard
              label="Drawdown max"
              value={`-${maxDD.toFixed(2)}R`}
              tone="negative"
            />
          </div>

          <div className="mb-6 rounded-xl border border-border bg-surface p-4 md:p-6">
            <h2 className="mb-4 text-sm font-medium">Courbe de R cumulés</h2>
            <EquityChart data={equityCurve} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-1 text-xs text-textSecondary">Trades gagnants</p>
              <p className="text-lg font-semibold text-profit">{wins}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-1 text-xs text-textSecondary">Trades perdants</p>
              <p className="text-lg font-semibold text-loss">{losses}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
            <h2 className="mb-4 text-sm font-medium">Performance par actif</h2>
            <PerformanceBySymbol trades={closed} />
          </div>
        </>
      )}
    </div>
  );
}
