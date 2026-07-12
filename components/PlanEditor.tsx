"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TradingPlan } from "@/types/database";
import { Save } from "lucide-react";

export default function PlanEditor({ plan }: { plan: TradingPlan }) {
  const supabase = createClient();
  const [objectives, setObjectives] = useState(plan.objectives ?? "");
  const [rules, setRules] = useState(plan.rules ?? "");
  const [riskRules, setRiskRules] = useState(plan.risk_management_rules ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("trading_plan")
      .update({
        objectives,
        rules,
        risk_management_rules: riskRules,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.id);
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
  }

  const labelClass = "mb-1 block text-xs text-textSecondary";
  const textareaClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>Objectifs</label>
        <textarea
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          rows={3}
          placeholder="Ex : atteindre 5% de croissance mensuelle, réduire le drawdown sous 10%..."
          className={textareaClass}
        />
      </div>

      <div>
        <label className={labelClass}>Règles de trading</label>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={5}
          placeholder="Ex : je ne trade que pendant les sessions Londres/New York, je n'entre jamais sans confirmation sur 2 timeframes..."
          className={textareaClass}
        />
      </div>

      <div>
        <label className={labelClass}>Règles de gestion du risque</label>
        <textarea
          value={riskRules}
          onChange={(e) => setRiskRules(e.target.value)}
          rows={4}
          placeholder="Ex : jamais plus de 1% par trade, stop-loss obligatoire, arrêt après 3 pertes consécutives..."
          className={textareaClass}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {savedAt && <span className="text-xs text-textSecondary">Sauvegardé à {savedAt}</span>}
      </div>
    </div>
  );
}
