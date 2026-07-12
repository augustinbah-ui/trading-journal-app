"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BehaviorFlagType } from "@/types/database";
import { Plus } from "lucide-react";

const FLAG_LABELS: Record<BehaviorFlagType, string> = {
  overtrading: "Sur-trading",
  revenge_trading: "Revenge trading",
  fomo: "FOMO (peur de rater)",
  no_stop_loss: "Trade sans stop-loss",
  plan_ignored: "Plan de trading ignoré",
  other: "Autre",
};

export default function BehaviorLogger() {
  const supabase = createClient();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [flagType, setFlagType] = useState<BehaviorFlagType>("overtrading");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("behavior_flags").insert({
      user_id: user.id,
      flag_type: flagType,
      note: note || null,
    });

    setSaving(false);
    setShowForm(false);
    setNote("");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Signaler un comportement</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          {showForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <select
            value={flagType}
            onChange={(e) => setFlagType(e.target.value as BehaviorFlagType)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            {Object.entries(FLAG_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Contexte (optionnel)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}
    </div>
  );
}
