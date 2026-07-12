"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Strategy } from "@/types/database";
import { Plus, Trash2, X } from "lucide-react";

export default function StrategyManager({ strategies }: { strategies: Strategy[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entryCriteria, setEntryCriteria] = useState("");
  const [exitCriteria, setExitCriteria] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("strategies").insert({
      user_id: user.id,
      name,
      description: description || null,
      entry_criteria: entryCriteria || null,
      exit_criteria: exitCriteria || null,
    });

    setSaving(false);
    setShowForm(false);
    setName("");
    setDescription("");
    setEntryCriteria("");
    setExitCriteria("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("strategies").delete().eq("id", id);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Mes stratégies / setups</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Annuler" : "Ajouter une stratégie"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
        >
          <input
            required
            placeholder="Nom de la stratégie (ex: Breakout matinal)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Description générale"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
          />
          <textarea
            placeholder="Critères d'entrée"
            value={entryCriteria}
            onChange={(e) => setEntryCriteria(e.target.value)}
            rows={2}
            className={inputClass}
          />
          <textarea
            placeholder="Critères de sortie"
            value={exitCriteria}
            onChange={(e) => setExitCriteria(e.target.value)}
            rows={2}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      )}

      {strategies.length === 0 ? (
        <p className="text-sm text-textSecondary">Aucune stratégie enregistrée.</p>
      ) : (
        <div className="space-y-2">
          {strategies.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                {s.description && (
                  <p className="mt-1 text-xs text-textSecondary">{s.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-textSecondary hover:text-loss"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
