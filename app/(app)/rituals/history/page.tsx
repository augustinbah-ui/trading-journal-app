import { createClient } from "@/lib/supabase/server";
import { DailyRitual } from "@/types/database";
import Link from "next/link";
import { ArrowLeft, Sun, Moon, Check, X } from "lucide-react";
import clsx from "clsx";

export default async function RitualsHistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rituals } = await supabase
    .from("daily_rituals")
    .select("*")
    .eq("user_id", user!.id)
    .order("ritual_date", { ascending: false })
    .limit(60);

  const r = (rituals as DailyRitual[]) ?? [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/rituals"
        className="mb-4 flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux rituels du jour
      </Link>

      <h1 className="mb-1 text-xl font-semibold">Historique des rituels</h1>
      <p className="mb-6 text-sm text-textSecondary">{r.length} jour(s) enregistré(s)</p>

      {r.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-textSecondary">
          Aucun rituel enregistré pour l'instant.
        </div>
      ) : (
        <div className="space-y-3">
          {r.map((ritual) => (
            <Link
              key={ritual.id}
              href={`/rituals/history/${ritual.ritual_date}`}
              className="block rounded-xl border border-border bg-surface p-4 transition hover:bg-surfaceHover"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">
                  {new Date(ritual.ritual_date + "T00:00:00").toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-textSecondary">
                <span className="flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-warning" />
                  Matin
                  {ritual.morning_checklist_done ? (
                    <Check className="h-3.5 w-3.5 text-profit" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-textSecondary/50" />
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-primary" />
                  Soir
                  {ritual.evening_done ? (
                    <Check className="h-3.5 w-3.5 text-profit" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-textSecondary/50" />
                  )}
                </span>
                {ritual.plan_respected !== null && (
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5",
                      ritual.plan_respected
                        ? "bg-profit/10 text-profit"
                        : "bg-loss/10 text-loss"
                    )}
                  >
                    Plan {ritual.plan_respected ? "respecté" : "non respecté"}
                  </span>
                )}
              </div>

              {ritual.what_worked && (
                <p className="mt-2 truncate text-xs text-textSecondary">
                  💡 {ritual.what_worked}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
