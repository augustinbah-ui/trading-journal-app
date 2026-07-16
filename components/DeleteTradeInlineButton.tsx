"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Check, X } from "lucide-react";

export default function DeleteTradeInlineButton({ tradeId }: { tradeId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);

    await supabase.from("trades").delete().eq("id", tradeId);

    setDeleting(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          title="Confirmer la suppression"
          className="rounded p-1.5 text-loss transition hover:bg-loss/10 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(false);
          }}
          disabled={deleting}
          title="Annuler"
          className="rounded p-1.5 text-textSecondary transition hover:bg-surfaceHover"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirming(true);
      }}
      title="Supprimer ce trade"
      className="rounded p-1.5 text-textSecondary transition hover:bg-loss/10 hover:text-loss"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
