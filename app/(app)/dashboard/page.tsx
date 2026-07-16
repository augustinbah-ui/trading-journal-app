import { createClient } from "@/lib/supabase/server";
import { Trade, Profile, DailyRitual, TradingAccount } from "@/types/database";
import {
  calcWinRate,
  calcTotalR,
  calcTodayR,
  calcCurrentLossStreak,
  getClosedTrades,
} from "@/lib/stats";
import StatCard from "@/components/StatCard";
import WhatsAppCard from "@/components/WhatsAppCard";
import AccountSelector from "@/components/AccountSelector";
import Link from "next/link";
import { TrendingUp, TrendingDown, Percent, Flame, Sun, Moon, ArrowRight } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const selectedAccount = searchParams.account ?? "";

  const [{ data: profile }, { data: allTrades }, { data: todayRitual }, { data: accounts }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user!.id).single(),
      supabase
        .from("trades")
        .select("*")
        .eq("user_id", user!.id)
        .order("entry_time", { ascending: false }),
      supabase
        .from("daily_rituals")
        .select("*")
        .eq("user_id", user!.id)
        .eq("ritual_date", new Date().toISOString().slice(0, 10))
        .maybeSingle(),
      supabase.from("trading_accounts").select("*").eq("user_id", user!.id),
    ]);

  const p = profile as Profile | null;
  const ritual = todayRitual as DailyRitual | null;
  const accountsList = (accounts as TradingAccount[]) ?? [];

  const t = ((allTrades as Trade[]) ?? []).filter(
    (trade) => !selectedAccount || trade.account_id === selectedAccount
  );

  const winRate = calcWinRate(t);
  const totalR = calcTotalR(t);
  const todayR = calcTodayR(t);
  const lossStreak = calcCurrentLossStreak(t);
  const openTrades = t.filter((x) => x.status === "open");
  const closedCount = getClosedTrades(t).length;

  const firstName = p?.full_name?.split(" ")[0] ?? "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          {firstName ? `Bonjour ${firstName}` : "Bonjour"} 👋
        </h1>
        <p className="text-sm text-textSecondary">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <AccountSelector accounts={accountsList} />

      {/* Alerte série de pertes */}
      {lossStreak >= 3 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-loss/30 bg-loss/10 p-4">
          <Flame className="h-5 w-5 shrink-0 text-loss" />
          <p className="text-sm text-loss">
            {lossStreak} pertes consécutives. C'est peut-être le moment de faire une pause avant
            le prochain trade.
          </p>
        </div>
      )}

      {/* Rituels du jour */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          href="/rituals"
          className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition hover:bg-surfaceHover"
        >
          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium">Brief du matin</p>
              <p className="text-xs text-textSecondary">
                {ritual?.morning_checklist_done ? "Complété" : "À faire"}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-textSecondary" />
        </Link>

        <Link
          href="/rituals"
          className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition hover:bg-surfaceHover"
        >
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Debrief du soir</p>
              <p className="text-xs text-textSecondary">
                {ritual?.evening_done ? "Complété" : "À faire"}
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-textSecondary" />
        </Link>
      </div>

      {/* Stats principales */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="R du jour"
          value={`${todayR >= 0 ? "+" : ""}${todayR.toFixed(2)}R`}
          icon={todayR >= 0 ? TrendingUp : TrendingDown}
          tone={todayR >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="R total"
          value={`${totalR >= 0 ? "+" : ""}${totalR.toFixed(2)}R`}
          icon={totalR >= 0 ? TrendingUp : TrendingDown}
          tone={totalR >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Win rate" value={`${winRate.toFixed(0)}%`} icon={Percent} />
        <StatCard label="Trades clôturés" value={`${closedCount}`} />
      </div>

      <WhatsAppCard />

      {/* Positions ouvertes */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Positions ouvertes ({openTrades.length})</h2>
          <Link href="/journal" className="text-xs text-primary hover:underline">
            Voir le journal
          </Link>
        </div>

        {openTrades.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-textSecondary">
            Aucune position ouverte actuellement.
          </div>
        ) : (
          <div className="space-y-2">
            {openTrades.slice(0, 5).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
              >
                <div>
                  <p className="text-sm font-medium">{trade.symbol}</p>
                  <p className="text-xs text-textSecondary">
                    {trade.direction === "long" ? "Achat" : "Vente"} · Entrée {trade.entry_price}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                  Ouvert
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Link
          href="/journal/new"
          className="rounded-xl bg-primary p-4 text-center text-sm font-medium text-white transition hover:opacity-90"
        >
          + Ajouter un trade
        </Link>
        <Link
          href="/calculator"
          className="rounded-xl border border-border bg-surface p-4 text-center text-sm transition hover:bg-surfaceHover"
        >
          Calculer le risque
        </Link>
      </div>
    </div>
  );
}
