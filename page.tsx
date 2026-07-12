import { createClient } from "@/lib/supabase/server";
import { DailyRitual, ChecklistItem } from "@/types/database";
import RitualsToday from "@/components/RitualsToday";

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
      <h1 className="mb-1 text-xl font-semibold">Rituels quotidiens</h1>
      <p className="mb-6 text-sm text-textSecondary">
        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      <RitualsToday
        ritual={ritual as DailyRitual | null}
        checklistItems={(checklistItems as ChecklistItem[]) ?? []}
      />
    </div>
  );
}
