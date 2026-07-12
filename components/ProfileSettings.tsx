"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import { Save } from "lucide-react";

const MARKETS = ["Forex", "Crypto", "Actions", "Indices", "Matières premières"];

export default function ProfileSettings({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [startingCapital, setStartingCapital] = useState(String(profile.starting_capital));
  const [currentCapital, setCurrentCapital] = useState(String(profile.current_capital));
  const [currency, setCurrency] = useState(profile.currency);
  const [tradingStyle, setTradingStyle] = useState(profile.trading_style);
  const [markets, setMarkets] = useState<string[]>(profile.markets ?? []);
  const [maxRiskPct, setMaxRiskPct] = useState(String(profile.max_risk_per_trade_pct));
  const [maxDailyLossPct, setMaxDailyLossPct] = useState(String(profile.max_daily_loss_pct));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleMarket(m: string) {
    setMarkets((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        starting_capital: parseFloat(startingCapital) || 0,
        current_capital: parseFloat(currentCapital) || 0,
        currency,
        trading_style: tradingStyle,
        markets,
        max_risk_per_trade_pct: parseFloat(maxRiskPct) || 1,
        max_daily_loss_pct: parseFloat(maxDailyLossPct) || 3,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
  const labelClass = "mb-1 block text-xs text-textSecondary";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nom complet</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Capital de départ</label>
          <input
            type="number"
            step="any"
            value={startingCapital}
            onChange={(e) => setStartingCapital(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Capital actuel</label>
          <input
            type="number"
            step="any"
            value={currentCapital}
            onChange={(e) => setCurrentCapital(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Devise</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Style de trading</label>
          <select
            value={tradingStyle}
            onChange={(e) => setTradingStyle(e.target.value as Profile["trading_style"])}
            className={inputClass}
          >
            <option value="day">Day trading</option>
            <option value="swing">Swing trading</option>
            <option value="both">Les deux</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Marchés tradés</label>
        <div className="flex flex-wrap gap-2">
          {MARKETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => toggleMarket(m)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                markets.includes(m)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-textSecondary hover:bg-surfaceHover"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Risque max par trade (%)</label>
          <input
            type="number"
            step="any"
            value={maxRiskPct}
            onChange={(e) => setMaxRiskPct(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Perte max journalière (%)</label>
          <input
            type="number"
            step="any"
            value={maxDailyLossPct}
            onChange={(e) => setMaxDailyLossPct(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Enregistrement..." : saved ? "Enregistré ✓" : "Enregistrer"}
      </button>
    </div>
  );
}
