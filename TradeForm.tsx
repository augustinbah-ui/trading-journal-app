"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trade, Strategy } from "@/types/database";

const EMOTIONS = ["Confiant", "Neutre", "Stressé", "Excité", "Anxieux", "Frustré"];

export default function TradeForm({
  strategies,
  existingTrade,
}: {
  strategies: Strategy[];
  existingTrade?: Trade;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    symbol: existingTrade?.symbol ?? "",
    direction: existingTrade?.direction ?? "long",
    entry_price: existingTrade?.entry_price ?? "",
    exit_price: existingTrade?.exit_price ?? "",
    stop_loss: existingTrade?.stop_loss ?? "",
    take_profit: existingTrade?.take_profit ?? "",
    position_size: existingTrade?.position_size ?? "",
    entry_time: existingTrade?.entry_time?.slice(0, 16) ?? new Date().toISOString().slice(0, 16),
    exit_time: existingTrade?.exit_time?.slice(0, 16) ?? "",
    status: existingTrade?.status ?? "open",
    strategy_id: existingTrade?.strategy_id ?? "",
    notes: existingTrade?.notes ?? "",
    emotion_before: existingTrade?.emotion_before ?? "",
    emotion_after: existingTrade?.emotion_after ?? "",
    followed_plan: existingTrade?.followed_plan ?? true,
  });

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function computeResult() {
    const entry = parseFloat(String(form.entry_price));
    const exit = parseFloat(String(form.exit_price));
    const size = parseFloat(String(form.position_size));
    if (isNaN(entry) || isNaN(exit) || isNaN(size)) return { amount: null, pct: null };

    const diff = form.direction === "long" ? exit - entry : entry - exit;
    const amount = diff * size;
    const pct = (diff / entry) * 100;
    return { amount, pct };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setLoading(false);
      return;
    }

    const { amount, pct } = computeResult();

    const payload = {
      user_id: user.id,
      symbol: form.symbol.toUpperCase(),
      direction: form.direction,
      entry_price: parseFloat(String(form.entry_price)),
      exit_price: form.exit_price ? parseFloat(String(form.exit_price)) : null,
      stop_loss: form.stop_loss ? parseFloat(String(form.stop_loss)) : null,
      take_profit: form.take_profit ? parseFloat(String(form.take_profit)) : null,
      position_size: parseFloat(String(form.position_size)),
      entry_time: new Date(form.entry_time).toISOString(),
      exit_time: form.exit_time ? new Date(form.exit_time).toISOString() : null,
      status: form.status,
      strategy_id: form.strategy_id || null,
      notes: form.notes || null,
      emotion_before: form.emotion_before || null,
      emotion_after: form.emotion_after || null,
      followed_plan: form.followed_plan,
      result_amount: form.status === "closed" ? amount : null,
      result_pct: form.status === "closed" ? pct : null,
    };

    const { error } = existingTrade
      ? await supabase.from("trades").update(payload).eq("id", existingTrade.id)
      : await supabase.from("trades").insert(payload);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/journal");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary";
  const labelClass = "mb-1 block text-xs text-textSecondary";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Actif *</label>
          <input
            required
            value={form.symbol}
            onChange={(e) => update("symbol", e.target.value)}
            placeholder="EURUSD"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sens *</label>
          <select
            value={form.direction}
            onChange={(e) => update("direction", e.target.value)}
            className={inputClass}
          >
            <option value="long">Achat (Long)</option>
            <option value="short">Vente (Short)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Prix d'entrée *</label>
          <input
            required
            type="number"
            step="any"
            value={form.entry_price}
            onChange={(e) => update("entry_price", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Taille de position *</label>
          <input
            required
            type="number"
            step="any"
            value={form.position_size}
            onChange={(e) => update("position_size", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Stop-loss</label>
          <input
            type="number"
            step="any"
            value={form.stop_loss}
            onChange={(e) => update("stop_loss", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Take-profit</label>
          <input
            type="number"
            step="any"
            value={form.take_profit}
            onChange={(e) => update("take_profit", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Statut</label>
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
          className={inputClass}
        >
          <option value="open">Ouvert</option>
          <option value="closed">Clôturé</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {form.status === "closed" && (
        <div>
          <label className={labelClass}>Prix de sortie *</label>
          <input
            required
            type="number"
            step="any"
            value={form.exit_price}
            onChange={(e) => update("exit_price", e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date/heure d'entrée *</label>
          <input
            required
            type="datetime-local"
            value={form.entry_time}
            onChange={(e) => update("entry_time", e.target.value)}
            className={inputClass}
          />
        </div>
        {form.status === "closed" && (
          <div>
            <label className={labelClass}>Date/heure de sortie</label>
            <input
              type="datetime-local"
              value={form.exit_time}
              onChange={(e) => update("exit_time", e.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </div>

      {strategies.length > 0 && (
        <div>
          <label className={labelClass}>Stratégie utilisée</label>
          <select
            value={form.strategy_id}
            onChange={(e) => update("strategy_id", e.target.value)}
            className={inputClass}
          >
            <option value="">— Aucune —</option>
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Émotion avant le trade</label>
          <select
            value={form.emotion_before}
            onChange={(e) => update("emotion_before", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {EMOTIONS.map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Émotion après le trade</label>
          <select
            value={form.emotion_after}
            onChange={(e) => update("emotion_after", e.target.value)}
            className={inputClass}
          >
            <option value="">—</option>
            {EMOTIONS.map((em) => (
              <option key={em} value={em}>
                {em}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.followed_plan}
          onChange={(e) => update("followed_plan", e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        J'ai respecté mon plan de trading
      </label>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          placeholder="Pourquoi ce trade ? Contexte du marché..."
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-loss">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : existingTrade ? "Mettre à jour" : "Enregistrer le trade"}
      </button>
    </form>
  );
}
