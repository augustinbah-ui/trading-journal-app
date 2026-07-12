"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DailyRitual, ChecklistItem } from "@/types/database";
import { Sun, Moon, Check } from "lucide-react";
import clsx from "clsx";

export default function RitualsToday({
  ritual,
  checklistItems,
}: {
  ritual: DailyRitual | null;
  checklistItems: ChecklistItem[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [morningNotes, setMorningNotes] = useState(ritual?.morning_notes ?? "");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const [whatWorked, setWhatWorked] = useState(ritual?.what_worked ?? "");
  const [whatDidntWork, setWhatDidntWork] = useState(ritual?.what_didnt_work ?? "");
  const [planRespected, setPlanRespected] = useState(ritual?.plan_respected ?? true);
  const [eveningNotes, setEveningNotes] = useState(ritual?.evening_notes ?? "");

  const [savingMorning, setSavingMorning] = useState(false);
  const [savingEvening, setSavingEvening] = useState(false);

  async function upsertRitual(fields: Partial<DailyRitual>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("daily_rituals")
      .upsert(
        { user_id: user.id, ritual_date: today, ...fields },
        { onConflict: "user_id,ritual_date" }
      );
  }

  async function saveMorning() {
    setSavingMorning(true);
    await upsertRitual({ morning_checklist_done: true, morning_notes: morningNotes });
    setSavingMorning(false);
    router.refresh();
  }

  async function saveEvening() {
    setSavingEvening(true);
    await upsertRitual({
      evening_done: true,
      what_worked: whatWorked,
      what_didnt_work: whatDidntWork,
      plan_respected: planRespected,
      evening_notes: eveningNotes,
    });
    setSavingEvening(false);
    router.refresh();
  }

  const textareaClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="flex flex-col gap-6">
      {/* Brief du matin */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sun className="h-5 w-5 text-warning" />
          <h2 className="text-sm font-medium">Brief du matin</h2>
          {ritual?.morning_checklist_done && (
            <span className="ml-auto flex items-center gap-1 text-xs text-profit">
              <Check className="h-3.5 w-3.5" /> Complété
            </span>
          )}
        </div>

        {checklistItems.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs text-textSecondary">Checklist avant de trader :</p>
            {checklistItems.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.id)}
                  onChange={(e) => {
                    const next = new Set(checkedItems);
                    e.target.checked ? next.add(item.id) : next.delete(item.id);
                    setCheckedItems(next);
                  }}
                  className="h-4 w-4 rounded border-border"
                />
                {item.label}
              </label>
            ))}
          </div>
        )}

        <textarea
          placeholder="Notes sur le contexte du marché aujourd'hui..."
          value={morningNotes}
          onChange={(e) => setMorningNotes(e.target.value)}
          rows={3}
          className={textareaClass}
        />

        <button
          onClick={saveMorning}
          disabled={savingMorning}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {savingMorning ? "Enregistrement..." : "Valider le brief du matin"}
        </button>
      </div>

      {/* Debrief du soir */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-medium">Debrief du soir</h2>
          {ritual?.evening_done && (
            <span className="ml-auto flex items-center gap-1 text-xs text-profit">
              <Check className="h-3.5 w-3.5" /> Complété
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-textSecondary">
              Qu'est-ce qui a bien fonctionné aujourd'hui ?
            </label>
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-textSecondary">
              Qu'est-ce qui n'a pas fonctionné ?
            </label>
            <textarea
              value={whatDidntWork}
              onChange={(e) => setWhatDidntWork(e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={planRespected}
              onChange={(e) => setPlanRespected(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            J'ai respecté mon plan de trading aujourd'hui
          </label>

          <div>
            <label className="mb-1 block text-xs text-textSecondary">Notes libres</label>
            <textarea
              value={eveningNotes}
              onChange={(e) => setEveningNotes(e.target.value)}
              rows={2}
              className={textareaClass}
            />
          </div>
        </div>

        <button
          onClick={saveEvening}
          disabled={savingEvening}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {savingEvening ? "Enregistrement..." : "Valider le debrief du soir"}
        </button>
      </div>
    </div>
  );
}
