import { createClient } from "@/lib/supabase/server";
import { TradingPlan, Strategy } from "@/types/database";
import PlanEditor from "@/components/PlanEditor";
import StrategyManager from "@/components/StrategyManager";

export default async function PlanPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: plan }, { data: strategies }] = await Promise.all([
    supabase.from("trading_plan").select("*").eq("user_id", user!.id).single(),
    supabase
      .from("strategies")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="mb-6 text-xl font-semibold">Plan de trading & stratégies</h1>

      <div className="mb-8 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-medium">Mon plan de trading</h2>
        <PlanEditor plan={plan as TradingPlan} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <StrategyManager strategies={(strategies as Strategy[]) ?? []} />
      </div>
    </div>
  );
}
