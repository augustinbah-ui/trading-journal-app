import { createClient } from "@/lib/supabase/server";
import { DailyRitual } from "@/types/database";
import Link from "next/link";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { notFound } from "next/navigation";

export default async function RitualDetailPage({ params }: { params: { date: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ritual } = await supabase
    .from("daily_rituals")
    .select("*")
    .eq("user_id", user!.id)
    .eq("ritual_date", params.date)
    .maybeSingle();

  if (!ritual) notFound();

  const r = ritual as DailyRitual;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/rituals/history"
        className="mb-4 flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l'historique
      </Link>

      <h1 className="mb-6 text-xl font-semibold">
        {new Date(r.ritual_date + "T00:00:00").toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h1>

      {/* Brief du matin */}
      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5 text-warning" />
          <h2 className="text-sm font-medium">Brief du matin</h2>
        </div>

        {r.morning_checklist_done ? (
          <p className="text-sm text-textSecondary">
            {r.morning_notes || "Aucune note laissée ce matin-là."}
          </p>
        ) : (
          <p className="text-sm text-textSecondary/60">Non complété ce jour-là.</p>
        )}
      </div>

      {/* Debrief du soir */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-medium">Debrief du soir</h2>
        </div>

        {r.evening_done ? (
          <div className="flex flex-col gap-4">
            {r.what_worked && (
              <div>
                <p className="mb-1 text-xs text-textSecondary">Ce qui a bien fonctionné</p>
                <p className="text-sm">{r.what_worked}</p>
              </div>
            )}
            {r.what_didnt_work && (
              <div>
                <p className="mb-1 text-xs text-textSecondary">Ce qui n'a pas fonctionné</p>
                <p className="text-sm">{r.what_didnt_work}</p>
              </div>
            )}
            {r.plan_respected !== null && (
              <div>
                <p className="mb-1 text-xs text-textSecondary">Plan de trading respecté</p>
                <p className={`text-sm ${r.plan_respected ? "text-profit" : "text-loss"}`}>
                  {r.plan_respected ? "Oui" : "Non"}
                </p>
              </div>
            )}
            {r.evening_notes && (
              <div>
                <p className="mb-1 text-xs text-textSecondary">Notes libres</p>
                <p className="text-sm">{r.evening_notes}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-textSecondary/60">Non complété ce jour-là.</p>
        )}
      </div>
    </div>
  );
}
