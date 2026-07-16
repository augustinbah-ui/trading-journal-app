"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, X } from "lucide-react";

export default function DeleteTradeButton({ tradeId }: { tradeId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const { error } = await supabase.from("trades").delete().eq("id", tradeId);

    setDeleting(false);

    if (error) {
      setError("Échec de la suppression : " + error.message);
      return;
    }

    router.push("/journal");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="rounded-lg border border-loss/30 bg-loss/10 p-4">
        <p className="mb-3 text-sm text-textPrimary">
          Supprimer définitivement ce trade ? Cette action est irréversible.
        </p>
        {error && <p className="mb-3 text-sm text-loss">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-loss px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Suppression..." : "Oui, supprimer"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-textSecondary transition hover:bg-surfaceHover"
          >
            <X className="h-4 w-4" />
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 rounded-lg border border-loss/30 px-4 py-2.5 text-sm text-loss transition hover:bg-loss/10"
    >
      <Trash2 className="h-4 w-4" />
      Supprimer ce trade
    </button>
  );
}
