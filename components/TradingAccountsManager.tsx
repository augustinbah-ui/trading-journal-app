"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TradingAccount } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

export default function TradingAccountsManager({ accounts }: { accounts: TradingAccount[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [broker, setBroker] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("trading_accounts").insert({
      user_id: user.id,
      name,
      broker: broker || null,
    });

    setSaving(false);
    setShowForm(false);
    setName("");
    setBroker("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await supabase.from("trading_accounts").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Comptes de trading</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-background p-4"
        >
          <input
            required
            placeholder="Nom du compte (ex: Compte principal)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            placeholder="Broker (optionnel)"
            value={broker}
            onChange={(e) => setBroker(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Ajout..." : "Ajouter le compte"}
          </button>
        </form>
      )}

      {accounts.length === 0 ? (
        <p className="text-sm text-textSecondary">Aucun compte configuré.</p>
      ) : (
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
            >
              <div>
                <p className="text-sm font-medium">{acc.name}</p>
                {acc.broker && <p className="text-xs text-textSecondary">{acc.broker}</p>}
              </div>
              <button onClick={() => handleDelete(acc.id)} className="text-textSecondary hover:text-loss">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
