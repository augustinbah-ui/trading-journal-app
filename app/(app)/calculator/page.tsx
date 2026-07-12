"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import { Calculator } from "lucide-react";

export default function CalculatorPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);

  const [capital, setCapital] = useState("");
  const [riskPct, setRiskPct] = useState("1");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data as Profile);
        setCapital(String((data as Profile).current_capital || ""));
        setRiskPct(String((data as Profile).max_risk_per_trade_pct || 1));
      }
    })();
  }, []);

  const capitalNum = parseFloat(capital);
  const riskPctNum = parseFloat(riskPct);
  const entryNum = parseFloat(entry);
  const slNum = parseFloat(stopLoss);
  const tpNum = parseFloat(takeProfit);

  const riskAmount = !isNaN(capitalNum) && !isNaN(riskPctNum) ? (capitalNum * riskPctNum) / 100 : null;

  const priceDiff = !isNaN(entryNum) && !isNaN(slNum) ? Math.abs(entryNum - slNum) : null;

  const positionSize = riskAmount && priceDiff && priceDiff > 0 ? riskAmount / priceDiff : null;

  const rewardDiff = !isNaN(entryNum) && !isNaN(tpNum) ? Math.abs(tpNum - entryNum) : null;

  const riskRewardRatio = priceDiff && rewardDiff && priceDiff > 0 ? rewardDiff / priceDiff : null;

  async function saveCalculation() {
    if (!riskAmount || !positionSize) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("risk_calculations").insert({
      user_id: user.id,
      capital: capitalNum,
      risk_pct: riskPctNum,
      entry_price: entryNum,
      stop_loss: slNum,
      take_profit: !isNaN(tpNum) ? tpNum : null,
      calculated_position_size: positionSize,
      risk_reward_ratio: riskRewardRatio,
    });
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary";
  const labelClass = "mb-1 block text-xs text-textSecondary";

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <Calculator className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Calculateur de risque</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <div>
          <label className={labelClass}>Capital total ({profile?.currency ?? "EUR"})</label>
          <input
            type="number"
            step="any"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>% de risque accepté sur ce trade</label>
          <input
            type="number"
            step="any"
            value={riskPct}
            onChange={(e) => setRiskPct(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Prix d'entrée</label>
            <input
              type="number"
              step="any"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Stop-loss</label>
            <input
              type="number"
              step="any"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Take-profit (optionnel)</label>
          <input
            type="number"
            step="any"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Résultats */}
      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs text-textSecondary">Montant risqué</p>
          <p className="text-lg font-semibold text-primary">
            {riskAmount !== null ? `${riskAmount.toFixed(2)} ${profile?.currency ?? "EUR"}` : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-textSecondary">Taille de position recommandée</p>
          <p className="text-lg font-semibold">
            {positionSize !== null ? positionSize.toFixed(4) : "—"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-textSecondary">Ratio risque/rendement</p>
          <p className="text-lg font-semibold">
            {riskRewardRatio !== null ? `1 : ${riskRewardRatio.toFixed(2)}` : "—"}
          </p>
          {riskRewardRatio !== null && riskRewardRatio < 1.5 && (
            <p className="mt-1 text-xs text-warning">
              Ratio faible — beaucoup de traders visent au moins 1:1.5 ou plus.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={saveCalculation}
        disabled={!positionSize}
        className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        Sauvegarder ce calcul
      </button>
    </div>
  );
}
