import { createClient } from "@/lib/supabase/server";
import { DailyRitual, ChecklistItem } from "@/types/database";
import RitualsToday from "@/components/RitualsToday";
import Link from "next/link";
import { History } from "lucide-react";

export default async function RitualsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: ritual }, { data: checklistItems }] = await Promise.all([
    supabase
      .from("daily_rituals")
      .select("*")
      .eq("user_id", user!.id)
      .eq("ritual_date", today)
      .maybeSingle(),
    supabase
      .from("checklist_items")
      .select("*")
      .eq("user_id", user!.id)
      .order("order_index"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rituels quotidiens</h1>
          <p className="text-sm text-textSecondary">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link
          href="/rituals/history"
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-textSecondary transition hover:bg-surfaceHover hover:text-textPrimary"
        >
          <History className="h-4 w-4" />
          Historique
        </Link>
      </div>

      <RitualsToday
        ritual={ritual as DailyRitual | null}
        checklistItems={(checklistItems as ChecklistItem[]) ?? []}
      />
    </div>
  );
}
