import { createClient } from "@/lib/supabase/server";
import { Trade, BehaviorFlag } from "@/types/database";
import BehaviorLogger from "@/components/BehaviorLogger";
import StatCard from "@/components/StatCard";
import { Brain, ShieldCheck } from "lucide-react";
import clsx from "clsx";

const FLAG_LABELS: Record<string, string> = {
  overtrading: "Sur-trading",
  revenge_trading: "Revenge trading",
  fomo: "FOMO",
  no_stop_loss: "Sans stop-loss",
  plan_ignored: "Plan ignoré",
  other: "Autre",
};

export default async function BehaviorPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: trades }, { data: flags }] = await Promise.all([
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "closed")
      .gte("entry_time", thirtyDaysAgo.toISOString()),
    supabase
      .from("behavior_flags")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const t = (trades as Trade[]) ?? [];
  const f = (flags as BehaviorFlag[]) ?? [];

  const tradesWithPlanInfo = t.filter((x) => x.followed_plan !== null);
  const respectedCount = tradesWithPlanInfo.filter((x) => x.followed_plan).length;
  const disciplineScore =
    tradesWithPlanInfo.length > 0
      ? Math.round((respectedCount / tradesWithPlanInfo.length) * 100)
      : null;

  const flagCounts = f.reduce<Record<string, number>>((acc, flag) => {
    acc[flag.flag_type] = (acc[flag.flag_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Suivi comportemental</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        <StatCard
          label="Score de discipline (30j)"
          value={disciplineScore !== null ? `${disciplineScore}%` : "—"}
          icon={ShieldCheck}
          tone={
            disciplineScore === null
              ? "neutral"
              : disciplineScore >= 70
              ? "positive"
              : "negative"
          }
        />
        <StatCard label="Comportements signalés (30j)" value={`${f.length}`} />
      </div>

      {Object.keys(flagCounts).length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-medium">Répartition des comportements</h2>
          <div className="space-y-2">
            {Object.entries(flagCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span>{FLAG_LABELS[type] ?? type}</span>
                  <span className="font-medium text-warning">{count}×</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <BehaviorLogger />
      </div>

      {f.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-medium">Historique récent</h2>
          <div className="space-y-3">
            {f.map((flag) => (
              <div key={flag.id} className="border-b border-border pb-3 text-sm last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{FLAG_LABELS[flag.flag_type]}</span>
                  <span className="text-xs text-textSecondary">
                    {new Date(flag.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {flag.note && <p className="mt-1 text-xs text-textSecondary">{flag.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
